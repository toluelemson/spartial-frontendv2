import React, { useState } from 'react';

interface Gpt3FetcherProps {
    prompt: string;
    onFetchSuccess: (response: string) => void;
    onFetchError: (error: string) => void;
}

const Gpt3Fetcher: React.FC<Gpt3FetcherProps> = ({ prompt, onFetchSuccess, onFetchError }) => {
    const [loading, setLoading] = useState(false);

    const fetchGpt3Response = async () => {
        setLoading(true);
        try {
            const apiKey = process.env.REACT_APP_OPENAI_API_KEY;

            const response = await fetch('https://api.openai.com/v1/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo-instruct',
                    prompt: prompt,
                    max_tokens: 150,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch explanation');
            }

            const result = await response.json();
            onFetchSuccess(result.choices[0].text.trim());
        } catch (error) {
            onFetchError('Failed to fetch explanation');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={fetchGpt3Response}
            style={{
                marginTop: '20px',
                padding: '10px 20px',
                fontSize: '14px',
                cursor: 'pointer',
                borderRadius: '5px',
                backgroundColor: '#4CAF50',
                color: '#fff',
                border: 'none'
            }}
        >
            {loading ? 'Loading...' : 'Get LLM Explanation'}
        </button>
    );
};

export default Gpt3Fetcher;
