import { useEffect, useState } from 'react'
import {supabase} from '../services/supabase'

export function useProfile(user) {
    const [profile, setProfile] = useState(null)
    const [loadingProfile, setLoadingProfile] = useState(true)

    useEffect(() => {
        if (!user) return
        loadProfile()
    }, [user])

    async function loadProfile() {
        setLoadingProfile(true)

        try {
            const {data, error} = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single()

            if (error && error.code !== 'pgrst116') throw error

            setProfile(data ?? null)
        } catch (err) {
            console.error('Error loading profile:', err)
        } finally {
            setLoadingProfile(false)
        }
    }

    async function saveProfile(faceData, skinType = null) {
        try {
            const profileData = {
                user_id: user.id,
                skin_type: skinType,
                skin_tone: faceData.skinTone,
                skin_tone_hex: faceData.skinToneHex,
                face_shape: faceData.faceShape,
                eye_shape: faceData.eyeShape,
                lip_fullness: faceData.lipFullNess,
                updated_at: new Date().toISOString(),
            }

            const {data, error} = await supabase
            .from('profiles')
            .upsert(profileData, {onConflict: 'user_id'})
            .select()
            .single()

            if (error) throw error
            setProfile(data)
            console.log('Profile saved ✅')
            return data
        } catch (err) {
            console.error('Error saving profile:', err)
        }
    }

    return {profile, loadingProfile, saveProfile, loadProfile}
}