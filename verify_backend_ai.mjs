
async function verifyBackend() {
    console.log("Verifying Backend AI Mock...");

    // Create a tiny white pixel base64 image
    const base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

    const payload = {
        image: base64Image,
        style: 'cyberpunk'
    };

    try {
        const response = await fetch('http://localhost:3000/api/ai/transform', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            if (data.image && data.image.startsWith('data:image/png;base64,')) {
                console.log("SUCCESS: Backend returned a valid base64 image.");
            } else {
                console.error("FAILURE: Backend returned invalid format.", data);
                process.exit(1);
            }
        } else {
            console.error(`FAILURE: Status ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error("Response:", text);
            process.exit(1);
        }

    } catch (e) {
        console.error("FAILURE: Connection error", e);
        process.exit(1);
    }
}

verifyBackend();
