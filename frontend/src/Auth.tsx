import {
    DynamicContextProvider,
    useConnectWithOtp,
    useDynamicContext
} from "@dynamic-labs/sdk-react-core";

import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import type { FC, FormEventHandler } from 'react';
import { useEffect, useState } from 'react'
import App from './App.tsx';
import './Auth.css'

const Footer = () => {
    return (
        <footer className="footer">
            <span>Built for the Dynamic takehome</span>
            <span className="sep">•</span>
            <span>Adam Soliman</span>
        </footer>
    )
}

const ConnectWithEmailView: FC = () => {
    const { user } = useDynamicContext()
    const [otpSent, setOtpSent] = useState(false)

    const { connectWithEmail, verifyOneTimePassword } = useConnectWithOtp();

    const onSubmitEmailHandler: FormEventHandler<HTMLFormElement> = async (
        event,
    ) => {
        event.preventDefault();

        const email = event.currentTarget.email.value;

        await connectWithEmail(email);
        setOtpSent(true)
    };

    const onSubmitOtpHandler: FormEventHandler<HTMLFormElement> = async (
        event,
    ) => {
        event.preventDefault();

        const otp = event.currentTarget.otp.value;

        await verifyOneTimePassword(otp);
    };

    // Rerender component anytime user changes to maintain security.
    useEffect(() => {
        console.log("User changed")
    }, [user]);

    // If the user is authenticated, render the main application.
    if (user) {
        return (<>
            <App />
            <Footer />
        </>)
    } else {
        return (
            <div className='auth-page'>
                <div className='auth-card'>
                    <header className='auth-header'>
                        <div className='auth-badge'>VenCura</div>
                        <h1>Welcome</h1>
                        <p>Securely access your wallets with a one-time passcode.</p>
                    </header>

                    <form className='auth-form' key='email-form' onSubmit={onSubmitEmailHandler}>
                        <label className='field'>
                            <span>Email address</span>
                            <input type='email' name='email' placeholder='you@example.com' required />
                        </label>
                        <button className='auth-button' type='submit'>Create Account / Sign In</button>
                    </form>

                    {otpSent && (
                        <form className='auth-form' key='otp-form' onSubmit={onSubmitOtpHandler}>
                            <label className='field'>
                                <span>One-time code</span>
                                <input
                                    type='text'
                                    name='otp'
                                    placeholder='Enter the 6-digit code'
                                    inputMode='numeric'
                                    required
                                />
                            </label>
                            <button className='auth-button secondary' type='submit'>Verify &amp; continue</button>
                        </form>
                    )}
                </div>
                <Footer />
            </div>
        )
    }
}

// Authentication page using Dynamic Labs SDK for login
export default function AuthenticationPage() {
    const environmentId = import.meta.env.VITE_ENVIRONMENT_ID;
    if (!environmentId) {
        return (
            <h2>
                Error: Cannot generate environment. Please try again later.
            </h2>
        )
    }

    return (
        <DynamicContextProvider
            settings={{
                environmentId: environmentId,
                walletConnectors: [EthereumWalletConnectors],
            }}
        >
            <ConnectWithEmailView />
        </DynamicContextProvider>
    )
}
