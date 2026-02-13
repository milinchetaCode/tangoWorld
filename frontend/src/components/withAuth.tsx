"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export interface WithAuthProps {
    requiredStatus?: string[];
}

export function withAuth<P extends object>(
    Component: React.ComponentType<P>,
    options: WithAuthProps = {}
) {
    return function AuthenticatedComponent(props: P) {
        const router = useRouter();
        const [isAuthorized, setIsAuthorized] = useState(false);

        useEffect(() => {
            const storedUser = localStorage.getItem("user");
            const token = localStorage.getItem("token");

            if (!token || !storedUser) {
                router.push("/login");
                return;
            }

            const user = JSON.parse(storedUser);

            if (options.requiredStatus && !options.requiredStatus.includes(user.organizerStatus)) {
                router.push("/");
                return;
            }

            setIsAuthorized(true);
        }, [router]);

        if (!isAuthorized) {
            return (
                <div className="flex items-center justify-center min-h-screen pt-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
                </div>
            );
        }

        return <Component {...props} />;
    };
}
