'use client'

import { motion } from 'framer-motion'

export default function LoadingSpinner() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <motion.div
                className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
        </div>
    )
}