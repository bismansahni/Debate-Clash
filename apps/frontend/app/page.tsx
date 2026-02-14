"use client";

import { useState, useEffect } from "react";
import { ArenaView } from "@/components/arena/ArenaView";
import { startDebate } from "@/app/actions/debate-actions";

export default function DebateArena() {
    const [debateData, setDebateData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [debateId, setDebateId] = useState<string | null>(null);

    const placeholders = [
        "Should AI replace human judges?",
        "Is remote work better than office work?",
        "Should social media be regulated?",
        "Is nuclear energy the future?",
        "Should college education be free?",
    ];

    // Poll for debate updates
    useEffect(() => {
        if (!debateId) return;

        const pollInterval = setInterval(async () => {
            try {
                const response = await fetch(`/api/debate/${debateId}`);
                if (response.ok) {
                    const data = await response.json();
                    setDebateData(data);

                    // Stop polling if debate is complete
                    if (data.status === 'completed') {
                        clearInterval(pollInterval);
                    }
                }
            } catch (error) {
                console.error('Error polling debate status:', error);
            }
        }, 2000); // Poll every 2 seconds

        return () => clearInterval(pollInterval);
    }, [debateId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.value);
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setDebateData(null);

        const formData = new FormData(e.currentTarget);
        const result = await startDebate(formData);

        if (result.error) {
            setError(result.error);
            setLoading(false);
            return;
        }

        if (result.success && result.debateId) {
            // Set debate ID to start polling
            setDebateId(result.debateId);

            // Show initial debate state
            setDebateData({
                debateId: result.debateId,
                topic: formData.get('query') as string,
                status: "researching",
                currentPhase: "Initializing debate...",
            });

            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black">
            {!debateData ? (
                <div className="h-screen flex flex-col justify-center items-center px-4">
                    <h2 className="mb-10 sm:mb-20 text-xl text-center sm:text-5xl dark:text-white text-black">
                        AI Debate Arena
                    </h2>
                    <p className="mb-8 text-neutral-500 dark:text-neutral-400 text-center max-w-2xl">
                        Enter any debate topic and watch AI agents research, argue, and compete in real-time
                    </p>

                    <form onSubmit={onSubmit} className="w-full max-w-2xl">
                        <input
                            type="text"
                            name="query"
                            onChange={handleChange}
                            placeholder={placeholders[0]}
                            className="w-full px-6 py-4 text-lg bg-white dark:bg-black border-2 border-neutral-200 dark:border-neutral-800 rounded-full focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                            required
                        />
                    </form>

                    {loading && (
                        <p className="mt-4 text-neutral-500 animate-pulse">
                            🤖 Assembling debate agents...
                        </p>
                    )}

                    {error && (
                        <div className="mt-8 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg max-w-2xl">
                            <p className="text-red-700 dark:text-red-300">
                                {error}
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <ArenaView debate={debateData} />
                    {debateData?.status === 'completed' && (
                        <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50">
                            <button
                                onClick={() => {
                                    setDebateData(null);
                                    setDebateId(null);
                                    setError("");
                                }}
                                className="px-4 py-2 sm:px-6 sm:py-3 bg-white text-black border-2 border-black dark:bg-black dark:text-white dark:border-white font-semibold rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all text-sm sm:text-base"
                            >
                                Start New Debate
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
