import { useState } from 'react'
import {supabase} from '../services/supabase'

export function useCart(user) {
    const [cart, setCart] = useState([])
    const [loadingCart, setLoadingCart] = useState(false)

    async function loadCart() {
        if (!user) return
        setLoadingCart(true)
        try {
            const {data, error} = await supabase
            .from('cart_items')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', {ascending: false})

            if (error) throw error
            setCart(data ?? [])
        } catch (err) {
            console.error('Error loading cart:', err)
        } finally {
            setLoadingCart(false)
        }
    }

    async function addToCart(product) {
        if (!user) return
        try {
            const {data, error} = await supabase
                .from('cart_items')
                .insert({
                    user_id: user.id,
                    product_name: product.product,
                    brand: product.brand ?? null,
                    shade: product.shade ?? null,
                    shade_hex: product.shadeHex ?? null,
                    price: product.price ?? null,
                    zone: product.zone ?? null,
                    style_name: product.styleName ?? null,
                })
                .select()
                .single()

            if (error) throw error
            setCart(prev => [data, ...prev])
            console.log('Added to cart ✅')
            return data
        } catch (err) {
            console.error('Error adding to cart:', err)
        }
    }

    async function removeFromCart(itemId) {
        try {
            const {error} = await supabase
            .from('cart_items')
            .delete()
            .eq('id', itemId)

            if (error) throw error
            setCart(prev => prev.filter(i => i.id !== itemId))
        } catch (err) {
            console.error('Error removing from cart:', err)
        }
    }

    function isInCart(productName, shade) {
        return cart.some(i => 
            i.product_name === productName && i.shade === shade
        )
    }

    return {cart, loadingCart, loadCart, addToCart, removeFromCart, isInCart}
}