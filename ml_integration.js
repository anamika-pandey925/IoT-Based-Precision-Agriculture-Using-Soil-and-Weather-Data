/**
 * ml_integration.js
 * Isolated snippet demonstrating how to connect the Frontend to the Python ML Backend.
 * You can safely include this in any HTML file if you test your Backend separately.
 */

const BACKEND_URL = "http://localhost:5000";

/**
 * Sends real-time sensor data to the Flask ML Model and updates the UI.
 * 
 * @param {number} moisture - Current Soil Moisture percentage
 * @param {number} temp - Current Environment Temperature
 */
async function makeMLPrediction(moisture, temp) {
    // Locate the HTML elements where the result should display
    const statusEl = document.getElementById('mlStatus');
    
    // Ignore if the UI elements aren't present on the current page
    if (!statusEl) return;
    
    // Set UI to loading state
    statusEl.innerText = "Analyzing...";
    statusEl.style.color = "var(--text-main)";

    try {
        // 1. Send data to Flask Backend using POST and Fetch API
        const response = await fetch(`${BACKEND_URL}/predict`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            // Convert Javascript variables into JSON payload
            body: JSON.stringify({ 
                moisture: moisture, 
                temperature: temp 
            })
        });

        // 2. Handle HTTP Errors (e.g. 404, 500)
        if (!response.ok) {
            throw new Error(`Server returned status ${response.status}`);
        }

        // 3. Parse JSON Prediction Result
        const data = await response.json();
        
        // 4. Update the UI with the final prediction
        statusEl.innerText = data.message;
        
        // Change text color based on urgency (1 = Optimal/Green, 0 = Requires Water/Red)
        if (data.prediction_value === 1) {
            statusEl.style.color = "var(--success-color, #00c853)";
        } else {
            statusEl.style.color = "var(--danger-color, #ff4757)";
        }

    } catch(error) {
        // 5. Handle Connection / Offline Errors Gracefully
        console.error("Machine Learning Connection Failed:", error);
        statusEl.innerText = "ML Offline";
        statusEl.style.color = "var(--text-muted, #7f8fa6)";
    }
}
