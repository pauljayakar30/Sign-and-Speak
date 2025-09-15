// Basic navigation between views
const views = document.querySelectorAll('.view');
const tabs = document.querySelectorAll('.tab');

// Camera/ML lifecycle control
let hands = null;
let faceMesh = null;
let camera = null;
let cameraRunning = false;

async function startChildSensors() {
    if (cameraRunning) return;
    // Init MediaPipe Hands
    if (!hands) {
        hands = new Hands({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
        hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
        hands.onResults(onResults);
    }
    // Init FaceMesh (optional)
    if (!faceMesh) {
        try {
            faceMesh = new FaceMesh({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}` });
            faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
            faceMesh.onResults(onFaceResults);
        } catch (e) {
            console.warn('FaceMesh not available', e);
        }
    }
    // Create camera loop
    camera = new Camera(videoElement, {
        onFrame: async () => {
            await hands.send({ image: videoElement });
            if (faceMesh) {
                try { await faceMesh.send({ image: videoElement }); } catch {}
            }
        },
        width: 640,
        height: 480
    });
    camera.start();
    cameraRunning = true;
}

function stopChildSensors() {
    if (!cameraRunning) return;
    try { camera?.stop?.(); } catch {}
    // Stop any active media tracks
    try {
        const stream = videoElement.srcObject;
        if (stream && typeof stream.getTracks === 'function') {
            stream.getTracks().forEach(t => { try { t.stop(); } catch {} });
        }
        videoElement.srcObject = null;
    } catch {}
    camera = null;
    cameraRunning = false;
    // Clear UI hints
    if (resultElement) resultElement.innerText = 'Show me a sign!';
}

function showView(id) {
    const prevWasChild = !document.querySelector('#child')?.classList.contains('hidden');
    views.forEach(v => v.classList.add('hidden'));
    const el = document.querySelector(id);
    if (el) el.classList.remove('hidden');
    const nowIsChild = id === '#child';
    if (nowIsChild && !prevWasChild) {
        startChildSensors();
    } else if (!nowIsChild && prevWasChild) {
        stopChildSensors();
    }
}

tabs.forEach(btn => btn.addEventListener('click', () => showView(btn.dataset.target)));
document.getElementById('choose-child')?.addEventListener('click', () => showView('#child'));
document.getElementById('choose-parent')?.addEventListener('click', () => showView('#parent'));
window.addEventListener('beforeunload', () => {
    try { stopChildSensors(); } catch {}
});

// Video/canvas and recognition
const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');
const resultElement = document.getElementById('result');

// This function will be called when MediaPipe gets results
function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        for (const landmarks of results.multiHandLandmarks) {
            // Draw the hand skeleton
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 5});
            drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 2});

            // --- THIS IS WHERE OUR LOGIC WILL GO ---
            recognizeSign(landmarks);
        }
    }
    canvasCtx.restore();
}

// Hands/FaceMesh and camera now start only when Child view is active (see startChildSensors)

// --- OUR GESTURE RECOGNITION LOGIC ---
// A simple function to calculate distance between two points
function getDistance(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function getPalmCenter(lm) {
    // average of wrist and MCPs
    const ids = [0, 5, 9, 13, 17];
    let x=0, y=0;
    ids.forEach(i => { x += lm[i].x; y += lm[i].y; });
    return { x: x/ids.length, y: y/ids.length };
}

function getHandSize(lm) {
    // distance wrist to middle MCP as a scale
    return getDistance(lm[0], lm[9]) || 1;
}

function recognizeSign(landmarks) {
    // Finger landmarks (tip, and a lower joint)
    const wrist = landmarks[0];
    const thumbTip = landmarks[4];
    const thumbIp = landmarks[3];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    const indexPip = landmarks[6];
    const middlePip = landmarks[10];
    const ringPip = landmarks[14];
    const pinkyPip = landmarks[18];

    const palmCenter = getPalmCenter(landmarks);
    const handSize = getHandSize(landmarks);
    const EXT_THRESH = 0.30; // fraction of hand size (slightly more permissive)
    const isExtended = (tip) => getDistance(tip, palmCenter) > EXT_THRESH * handSize;

    const indexExt = isExtended(indexTip);
    const middleExt = isExtended(middleTip);
    const ringExt = isExtended(ringTip);
    const pinkyExt = isExtended(pinkyTip);
    const thumbExt = getDistance(thumbTip, thumbIp) > 0.05 || isExtended(thumbTip);

    // Check for "STOP" (Open Palm)
    // Logic: 4+ fingers extended AND good spread across hand width
    const spread = getDistance(indexTip, pinkyTip) / handSize;
    let is_open_palm = (indexExt && middleExt && ringExt && pinkyExt) && spread > 0.7;


    // Check for "MILK" (Closed Fist)
    // Logic: Are all fingertips very close to the middle of the palm?
    let is_fist =
        !indexExt && !middleExt && !ringExt && !pinkyExt && !thumbExt;

    // Additional signs
    const is_thumbs_up = thumbExt && !indexExt && !middleExt && !ringExt && !pinkyExt;
    const is_peace = indexExt && middleExt && !ringExt && !pinkyExt;
    const is_point = indexExt && !middleExt && !ringExt && !pinkyExt;

    // Wave: open palm plus wrist X oscillation
    trackWrist(wrist);
    const is_wave = is_open_palm && hasWristOscillation();

    // Decide on a raw label (specific patterns first)
    let raw = 'NONE';
    if (is_wave) raw = 'WAVE';
    else if (is_thumbs_up) raw = 'THUMBS_UP';
    else if (is_peace) raw = 'PEACE';
    else if (is_point) raw = 'POINT';
    else if (is_fist) raw = 'MILK';
    else if (is_open_palm) raw = 'STOP';

    updateGesture(raw);
}
let lastSpoken = "";
let lastSpokenTime = 0;

function speak(text) {
    const now = Date.now();
    if (text === lastSpoken && now - lastSpokenTime < 3000) {
        return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
    lastSpoken = text;
    lastSpokenTime = now;
}

// Smoothing over last N frames
const gestureBuffer = [];
function majorityLabel(buf) {
    const counts = {};
    for (const l of buf) { counts[l] = (counts[l]||0)+1; }
    let best = 'NONE', bestC = 0;
    for (const k in counts) {
        if (k === 'NONE') continue;
        if (counts[k] > bestC) { best = k; bestC = counts[k]; }
    }
    return { label: best, count: bestC };
}
const REQUIRED_HOLD_MS = 3000;
const WAVE_COOLDOWN_MS = 1500; // WAVE triggers immediately with this cooldown
let lastWaveAt = 0;
let observedLabel = 'NONE';
let observedSince = 0;
function updateGesture(raw) {
    const N = 7;
    gestureBuffer.push(raw);
    if (gestureBuffer.length > N) gestureBuffer.shift();
    const { label, count } = majorityLabel(gestureBuffer);
    const now = Date.now();
    const stable = count >= 4; // require 4/7 frames agreement

    // Immediate handling for dynamic WAVE: no 3s hold, short cooldown
    if (stable && label === 'WAVE') {
        if (now - lastWaveAt > WAVE_COOLDOWN_MS) {
            resultElement.innerText = 'WAVE';
            speak('Hello');
            sendChildEvent({ type: 'sign', payload: { value: 'WAVE' } });
            lastWaveAt = now;
        }
        return; // skip hold logic for wave
    }

    if (stable && label && label !== 'NONE') {
        if (label !== observedLabel) {
            observedLabel = label;
            observedSince = now;
        }
        const elapsed = now - observedSince;
        const remaining = Math.max(0, Math.ceil((REQUIRED_HOLD_MS - elapsed)/100) / 10); // 0.1s precision
        if (elapsed >= REQUIRED_HOLD_MS) {
            // Speak and send, then reset observation start to allow repeating every 3s if held
            resultElement.innerText = label.replace('_',' ');
            const speech = ({
                'WAVE':'Hello','STOP':'Stop','MILK':'Milk','THUMBS_UP':'Good job','PEACE':'Peace','POINT':'Point'
            })[label] || label;
            speak(speech);
            sendChildEvent({ type: 'sign', payload: { value: label } });
            observedSince = now; // restart observation window
        } else {
            resultElement.innerText = `Hold ${label.replace('_',' ')} ${remaining.toFixed(1)}s`;
        }
    } else {
        // Not stable or NONE
        observedLabel = 'NONE';
        observedSince = 0;
        resultElement.innerText = 'Show me a sign!';
    }
}

// Wrist oscillation detection for waving
const wristTrail = [];
function trackWrist(w) {
    const now = Date.now();
    wristTrail.push({ t: now, x: w.x });
    // keep last ~1.5s
    while (wristTrail.length && now - wristTrail[0].t > 1500) wristTrail.shift();
}
function hasWristOscillation() {
    if (wristTrail.length < 6) return false;
    const xs = wristTrail.map(p => p.x);
    const min = Math.min(...xs), max = Math.max(...xs);
    const range = max - min;
    if (range < 0.06) return false;
    // count direction changes
    let changes = 0;
    for (let i = 2; i < xs.length; i++) {
        const a = xs[i] - xs[i-1];
        const b = xs[i-1] - xs[i-2];
        if (a*b < 0) changes++;
    }
    return changes >= 2;
}
const askButton = document.getElementById('a');
const parentPrompt = document.getElementById('parent-prompt');
const aiResponse = document.getElementById('ai-response');

askButton.addEventListener('click', async () => {
    const prompt = parentPrompt.value;
    if (!prompt) return;

    aiResponse.innerText = "Thinking...";
    askButton.disabled = true;
    try {
        // Replit automatically provides the server URL
        const response = await fetch('/ask-gpt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt: prompt })
        });

        const data = await response.json();
        if (data && data.response) {
            aiResponse.innerText = `${data.demo ? '[Demo] ' : ''}${data.response}`;
        } else {
            aiResponse.innerText = 'AI is unavailable right now. Please try again later.';
        }
    } catch (error) {
        aiResponse.innerText = "Error connecting to the server.";
    } finally {
        askButton.disabled = false;
    }
});

// Pairing: parent generate, child claim, parent poll feed
const parentGenerateBtn = document.getElementById('parent-generate');
const parentCodeEl = document.getElementById('parent-code');
const parentPairStatus = document.getElementById('parent-pair-status');
const parentFeedEl = document.getElementById('parent-feed');
const childJoinBtn = document.getElementById('child-join');
const childCodeInput = document.getElementById('child-code');
const childPairStatus = document.getElementById('child-pair-status');

let currentPairCode = null;

parentGenerateBtn?.addEventListener('click', async () => {
    parentPairStatus.innerText = '';
    parentCodeEl.innerText = 'Generating...';
    const res = await fetch('/pair/generate', { method: 'POST' });
    const data = await res.json();
    currentPairCode = data.code;
    parentCodeEl.innerText = `Code: ${currentPairCode}`;
    // start polling status and feed
    pollPairStatus();
    pollFeed();
});

childJoinBtn?.addEventListener('click', async () => {
    const code = childCodeInput.value.trim();
    if (!code) return;
    childPairStatus.innerText = 'Joining...';
    const res = await fetch('/pair/claim', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) });
    const data = await res.json();
    if (data.error) childPairStatus.innerText = data.error; else childPairStatus.innerText = 'Connected!';
    sessionStorage.setItem('pairCode', code);
});

async function pollPairStatus() {
    if (!currentPairCode) return;
    try {
        const res = await fetch(`/pair/status/${currentPairCode}`);
        if (!res.ok) return;
        const data = await res.json();
        parentPairStatus.innerText = data.claimed ? 'Child connected' : 'Waiting for child...';
    } catch {}
    setTimeout(pollPairStatus, 2000);
}

async function pollFeed() {
    if (!currentPairCode) return;
    try {
        const res = await fetch(`/pair/feed/${currentPairCode}`);
        if (!res.ok) return;
        const data = await res.json();
        parentFeedEl.innerHTML = (data.feed || []).map(e => {
            const dt = new Date(e.t).toLocaleTimeString();
            if (e.type === 'sign') {
                const val = (e.payload?.value ?? e.value ?? '').toString();
                return `<div class="feed-item"><strong>${dt}</strong>: Recognized ${val}</div>`;
            }
            return `<div class="feed-item"><strong>${dt}</strong>: ${e.type}</div>`;
        }).join('');
    } catch {}
    setTimeout(pollFeed, 2000);
}

async function sendChildEvent(event) {
    const code = sessionStorage.getItem('pairCode');
    if (!code) return;
    try {
        await fetch('/pair/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, ...event }) });
    } catch {}
}

// Daily plan generation
const dailyBtn = document.getElementById('daily-generate');
const dailyFocus = document.getElementById('daily-focus');
const dailyRole = document.getElementById('daily-role');
const dailyOutput = document.getElementById('daily-output');

dailyBtn?.addEventListener('click', async () => {
    const role = dailyRole.value;
    const focus = dailyFocus.value || 'MILK';
    dailyOutput.innerText = 'Creating…';
    try {
        const res = await fetch('/ask-daily', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role, focus }) });
                const data = await res.json();
                dailyOutput.innerText = (data && data.response)
                    ? `${data.demo ? '[Demo] ' : ''}${data.response}`
                    : 'AI is unavailable right now. Please try again later.';
    } catch(e) {
        dailyOutput.innerText = 'Network error creating plan.';
    }
});

// Stories
const storyBtn = document.getElementById('story-generate');
const storySpeakBtn = document.getElementById('story-speak');
const storyTheme = document.getElementById('story-theme');
const storySigns = document.getElementById('story-signs');
const storyOutput = document.getElementById('story-output');

storyBtn?.addEventListener('click', async () => {
    const theme = storyTheme.value || 'bedtime';
    const signs = (storySigns.value || 'MILK, STOP').split(',').map(s => s.trim()).filter(Boolean);
    storyOutput.innerText = 'Creating story…';
    try {
        const res = await fetch('/ask-story', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ theme, signs }) });
                const data = await res.json();
                storyOutput.innerText = (data && data.response)
                    ? `${data.demo ? '[Demo] ' : ''}${data.response}`
                    : 'AI is unavailable right now. Please try again later.';
    } catch {
        storyOutput.innerText = 'Network error creating story.';
    }
});

storySpeakBtn?.addEventListener('click', () => {
    const text = storyOutput?.innerText?.trim();
    if (!text) return;
    speak(text);
});

// --- Face mood detection (MediaPipe Face Mesh) ---
let lastMood = '';
let lastMoodSentAt = 0;
function recognizeMood(faceLandmarks) {
    const lm = faceLandmarks; if (!lm || lm.length < 468) return 'Neutral';
    const leftCheek = lm[234];
    const rightCheek = lm[454];
    const faceWidth = getDistance(leftCheek, rightCheek) || 1;

    const mouthLeft = lm[61];
    const mouthRight = lm[291];
    const mouthTop = lm[13];
    const mouthBottom = lm[14];
    const mouthW = getDistance(mouthLeft, mouthRight) / faceWidth;
    const mouthOpen = getDistance(mouthTop, mouthBottom) / faceWidth;

    let mood = 'Neutral';
    if (mouthOpen > 0.06 || mouthW > 0.45) mood = 'Happy';
    else if (mouthOpen < 0.02 && mouthW < 0.35) mood = 'Sad';
    return mood;
}

const moodLabel = document.getElementById('mood-label');
function onFaceResults(results) {
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        const mood = recognizeMood(landmarks);
        if (moodLabel) moodLabel.innerText = mood;
        const now = Date.now();
        if (mood !== lastMood && (now - lastMoodSentAt) > 5000) {
            lastMood = mood; lastMoodSentAt = now;
            sendChildEvent({ type: 'mood', payload: { value: mood } });
        }
    }
}

// FaceMesh initialization is handled in startChildSensors

// Parent Mood Coach
const moodAdviceBtn = document.getElementById('mood-advice');
const moodAdviceOut = document.getElementById('mood-advice-output');
async function getLatestMoodFromFeed() {
    const codeText = document.getElementById('parent-code')?.innerText || '';
    const code = codeText.replace('Code:','').trim();
    if (!code) return null;
    const r = await fetch(`/pair/feed/${code}`);
    if (!r.ok) return null;
    const d = await r.json();
    const moodItem = (d.feed || []).find(e => e.type === 'mood');
    return moodItem?.payload?.value || null;
}
moodAdviceBtn?.addEventListener('click', async () => {
    moodAdviceOut.innerText = 'Getting advice…';
    const mood = await getLatestMoodFromFeed();
    if (!mood) { moodAdviceOut.innerText = 'No recent mood detected yet.'; return; }
    try {
        const res = await fetch('/ask-mood', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mood }) });
        const data = await res.json();
        moodAdviceOut.innerText = (data && data.response)
          ? `${data.demo ? '[Demo] ' : ''}${data.response}`
          : 'AI is unavailable right now. Please try again later.';
    } catch {
        moodAdviceOut.innerText = 'Network error getting advice.';
    }
});

// Child Coach
const coachBtn = document.getElementById('coach-get');
const coachSign = document.getElementById('coach-sign');
const coachAge = document.getElementById('coach-age');
const coachOutput = document.getElementById('coach-output');

coachBtn?.addEventListener('click', async () => {
    const sign = (coachSign.value || 'MILK').trim();
    const age = (coachAge.value || '4').trim();
    coachOutput.innerText = 'Getting tips…';
    try {
        const res = await fetch('/ask-coach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sign, age }) });
        const data = await res.json();
        coachOutput.innerText = (data && data.response)
          ? `${data.demo ? '[Demo] ' : ''}${data.response}`
          : 'AI is unavailable right now. Please try again later.';
    } catch {
        coachOutput.innerText = 'Network error getting tips.';
    }
});

// Weekly Plan
const weeklyBtn = document.getElementById('weekly-generate');
const weeklyFocus = document.getElementById('weekly-focus');
const weeklyDays = document.getElementById('weekly-days');
const weeklyOutput = document.getElementById('weekly-output');

weeklyBtn?.addEventListener('click', async () => {
    const focus = weeklyFocus.value || 'STOP';
    const days = Number(weeklyDays.value || 5);
    weeklyOutput.innerText = 'Creating plan…';
    try {
        const res = await fetch('/ask-weekly', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ focus, days }) });
        const data = await res.json();
        weeklyOutput.innerText = (data && data.response)
          ? `${data.demo ? '[Demo] ' : ''}${data.response}`
          : 'AI is unavailable right now. Please try again later.';
    } catch {
        weeklyOutput.innerText = 'Network error creating plan.';
    }
});

// Parent Insights (uses current feed content if available)
const insightsBtn = document.getElementById('insights-generate');
const insightsOutput = document.getElementById('insights-output');

insightsBtn?.addEventListener('click', async () => {
    insightsOutput.innerText = 'Summarizing…';
    try {
        // Attempt to pull latest feed shown in UI (or we could refetch directly)
        const codeText = document.getElementById('parent-code')?.innerText || '';
        const code = codeText.replace('Code:','').trim();
        let feed = [];
        if (code) {
            const r = await fetch(`/pair/feed/${code}`);
            if (r.ok) { const d = await r.json(); feed = d.feed || []; }
        }
                const res = await fetch('/ask-insights', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ feed }) });
                const data = await res.json();
                insightsOutput.innerText = (data && data.response)
                    ? `${data.demo ? '[Demo] ' : ''}${data.response}`
                    : 'AI is unavailable right now. Please try again later.';
    } catch {
        insightsOutput.innerText = 'Network error creating insights.';
    }
});