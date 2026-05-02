import { useState } from 'react'
import {supabase} from '../services/supabase'

export function useLooks(user) {
    const [looks, setLooks] = useState([])
    const [loadingLooks, setLoadingLooks] = useState(false)

    async function loadLooks() {
        if (!user) return
        setLoadingLooks(true)
        try {
            const {data, error} = await supabase
            .from('saved_looks')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', {ascending: false})

            if (error) throw error
            setLooks(data ?? [])
        } catch (err) {
            console.error('Error loading looks:', err)
        } finally {
            setLoadingLooks(false)
        }
    }

    function isLookSaved(styleName, steps) {
        return looks.some(look => 
            look.style_name === styleName &&
            JSON.stringify(look.steps) === JSON.stringify(steps)
        )
    }

    async function saveLook(styleName, faceData, steps) {
        if (!user) {
            console.error('No user — cannot save look')
            return
        }

        if (isLookSaved(styleName, steps)) {
            console.log('Look already saved - skipping')
            return {error: 'already_saved'}
        }

        try {
            const { data, error } = await supabase
            .from('saved_looks')
            .insert({
                user_id:    user.id,
                style_name: styleName,
                face_data:  faceData,
                steps:      steps,
            })
            .select()
            .single()

            if (error) {
            console.error('Supabase error saving look:', error)
            throw error
            }

            console.log('Look saved to database ✅', data)
            setLooks(prev => [data, ...prev])
            return data

        } catch (err) {
            console.error('Error saving look:', err)
        }
        }

    async function deleteLook(lookId) {
        try {
            const {error} = await supabase
            .from('saved_looks')
            .delete()
            .eq('id', lookId)

            if (error) throw error
            setLooks(prev => prev.filter(l => l.id !== lookId))
        } catch (err) {
            console.error('Error deleting look:', err)
        }
    }

    return {looks, loadingLooks, loadLooks, saveLook, isLookSaved, deleteLook}
}