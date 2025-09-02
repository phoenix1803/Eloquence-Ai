import { SignIn } from '@clerk/nextjs'

export default function Page() {
    return (
        <div className="min-h-screen pt-16 flex items-center justify-center section-padding bg-gray-50">
            <SignIn
                appearance={{
                    elements: {
                        formButtonPrimary: 'bg-black hover:bg-gray-800 text-sm normal-case',
                        card: 'shadow-none border border-gray-200',
                        headerTitle: 'hidden',
                        headerSubtitle: 'hidden',
                        socialButtonsBlockButton: 'border border-gray-200 hover:bg-gray-50',
                        socialButtonsBlockButtonText: 'text-gray-700',
                        formFieldInput: 'border border-gray-200 focus:border-black focus:ring-black',
                        footerActionLink: 'text-black hover:text-gray-800',
                    },
                }}
            />
        </div>
    )
}