import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { useGoogleAuth } from '../../services/authApi'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { FaGoogle } from 'react-icons/fa6'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

const LoginDialog = ({ open, onClose, onLoginSuccess }) => {
    const handleLogin = useGoogleAuth({
        onSuccess: () => {
            onClose()
            onLoginSuccess?.();
            toast.success("Login Successful !!!")
        }
    })
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-94 border-none bg-white">
                <DialogHeader>
                    <DialogTitle>Login to Your Account</DialogTitle>
                    <DialogDescription>
                        Log In to unlock AI itineries and save your plans.Sync your travel Schedules across all your devices.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            <a
                                href="#"
                                className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                            >
                                Forgot your password?
                            </a>
                        </div>

                        <Input
                            id="password"
                            type="password"
                            required
                        />
                    </div>
                </div>
                <DialogFooter className="grid grid-cols-1 gap-3 mt-3">
                    <Button type="submit" className="w-full rounded-md" disabled={true}>
                        Login
                    </Button>
                    <Button onClick={handleLogin} className={"w-full rounded-md "} >
                        <FaGoogle /> Login with Google
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default LoginDialog