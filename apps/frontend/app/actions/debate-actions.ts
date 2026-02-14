'use server'

const BACKEND_URL = 'http://localhost:3001';

export async function startDebate(formData: FormData) {
    const topic = formData.get('query') as string;

    if (!topic) {
        return { error: 'Please provide a debate topic' };
    }

    try {
        // Trigger the ENHANCED debate via backend API
        const response = await fetch(`${BACKEND_URL}/api/trigger-enhanced-debate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ topic }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to start debate: ${response.statusText}`);
        }

        const result = await response.json();

        return {
            success: true,
            debateId: result.debateId,
            message: 'Debate started successfully!',
        };
    } catch (error) {
        console.error('Error starting debate:', error);
        return {
            error: error instanceof Error ? error.message : 'Failed to start debate',
        };
    }
}

export async function getDebateStatus(debateId: string) {
    // For now, we'll poll Inngest dev server
    // In production, you'd store debate state in a database

    // This is a placeholder - Inngest doesn't expose run status via API by default
    // We'd need to either:
    // 1. Store debate state in a database as it progresses
    // 2. Use Inngest's run API (requires API key)
    // 3. Stream events via SSE

    return {
        debateId,
        status: 'in-progress',
        message: 'Debate status tracking will be implemented with database integration',
    };
}
