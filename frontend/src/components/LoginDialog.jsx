import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from './ui/dialog';
import LoginForm from './LoginForm';

const LoginDialog = ({ open, onOpenChange }) => {
    const navigate = useNavigate();

    const handleOpenChange = (next) => {
        onOpenChange(next);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="w-[calc(100%-2rem)] max-w-[420px] max-h-[90vh] overflow-y-auto rounded-2xl border-0 p-0 bg-white shadow-[0_24px_80px_rgba(13,27,62,0.28)] gap-0 sm:rounded-2xl">
                <DialogTitle className="sr-only">Log in to PetroFI</DialogTitle>
                <DialogDescription className="sr-only">
                    Enter the phone number or email on your PetroFI account. We will send a 6-digit code.
                </DialogDescription>
                <div className="px-6 py-7 sm:px-8 sm:py-8">
                    {open ? (
                        <LoginForm
                            key="open"
                            onSuccess={() => {
                                handleOpenChange(false);
                                navigate('/subscription');
                            }}
                        />
                    ) : null}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default LoginDialog;
