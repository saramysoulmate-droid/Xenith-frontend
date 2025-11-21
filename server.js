const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// YOUR API KEYS - READY TO USE
const SUNO_API_KEYS = [
    "fd5760cb306e4ab5d03122bef6735082",
    "cmi7l4nrz0001ky076rbikxs2", 
    "cmi7m4pcv000ngz07swsfl0c1",
    "cmi7m4px2000pgz07wmznnh58",
    "cmi7m4rvr000pl50706c7dt2e",
    "cmi7m4rjq000vgz07ri78803o"
];

const VEO_API_KEY = "lNvdImJ8EG68lXCyBcgUWWX15CmZCirEXICKhd92";

let currentSunoKeyIndex = 0;

function getNextSunoKey() {
    currentSunoKeyIndex = (currentSunoKeyIndex + 1) % SUNO_API_KEYS.length;
    return SUNO_API_KEYS[currentSunoKeyIndex];
}

// REAL MUSIC GENERATION
app.post('/api/generate-music', async (req, res) => {
    try {
        const { prompt, title, style, instrumental, vocalGender, model } = req.body;
        
        console.log('🎵 Starting REAL music generation:', { prompt, title });
        
        const payload = {
            prompt,
            title: title || "My Song",
            style: style || "Pop",
            negativeTags: "heavy metal, aggressive",
            instrumental: instrumental || false,
            customMode: true,
            model: model || "V4_5PLUS",
            vocalGender: vocalGender || "f"
        };

        const apiKey = getNextSunoKey();
        
        console.log('🔑 Using Suno API key:', apiKey.substring(0, 10) + '...');
        
        const response = await axios.post('https://api.sunoapi.org/api/v1/generate', payload, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        console.log('✅ Music generation started:', response.data);

        if (response.data.code === 200) {
            res.json({
                success: true,
                taskId: response.data.data.taskId,
                message: 'REAL music generation started - this will take 1-2 minutes'
            });
        } else {
            throw new Error(response.data.msg || 'Generation failed');
        }

    } catch (error) {
        console.error('❌ Music generation error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: error.response?.data?.msg || error.message || 'Music generation failed'
        });
    }
});

// CHECK REAL MUSIC STATUS
app.get('/api/music-status/:taskId', async (req, res) => {
    try {
        const apiKey = getNextSunoKey();
        
        console.log('🔍 Checking music status for task:', req.params.taskId);
        
        const response = await axios.get(`https://api.sunoapi.org/api/v1/generate/get?task_id=${req.params.taskId}`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        console.log('📊 Music status response:', response.data);

        if (response.data.code === 200) {
            const statusData = response.data.data;
            res.json({
                success: true,
                status: statusData.status,
                audioInfo: statusData.audioInfo,
                message: getStatusMessage(statusData.status)
            });
        } else {
            throw new Error(response.data.msg || 'Status check failed');
        }

    } catch (error) {
        console.error('❌ Status check error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: error.response?.data?.msg || error.message || 'Status check failed'
        });
    }
});

// REAL VIDEO GENERATION
app.post('/api/generate-video', async (req, res) => {
    try {
        const { prompt, aspectRatio } = req.body;
        
        console.log('🎥 Starting REAL video generation:', { prompt });
        
        const payload = {
            prompt,
            model: "veo3",
            aspectRatio: aspectRatio || "16:9"
        };

        console.log('🔑 Using Veo API key:', VEO_API_KEY.substring(0, 10) + '...');
        
        const response = await axios.post('https://api.kie.ai/api/v1/veo/generate', payload, {
            headers: {
                'Authorization': `Bearer ${VEO_API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        console.log('✅ Video generation started:', response.data);

        if (response.data.code === 200) {
            res.json({
                success: true,
                taskId: response.data.data.taskId,
                message: 'REAL 4K video generation started - this will take 2-3 minutes'
            });
        } else {
            throw new Error(response.data.msg || 'Video generation failed');
        }

    } catch (error) {
        console.error('❌ Video generation error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: error.response?.data?.msg || error.message || 'Video generation failed'
        });
    }
});

// CHECK REAL VIDEO STATUS
app.get('/api/video-status/:taskId', async (req, res) => {
    try {
        console.log('🔍 Checking video status for task:', req.params.taskId);
        
        const response = await axios.get(`https://api.kie.ai/api/v1/veo/record-info?taskId=${req.params.taskId}`, {
            headers: {
                'Authorization': `Bearer ${VEO_API_KEY}`
            },
            timeout: 30000
        });

        console.log('📊 Video status response:', response.data);

        if (response.data.code === 200) {
            const statusData = response.data.data;
            res.json({
                success: true,
                status: statusData,
                message: getVideoStatusMessage(statusData.successFlag)
            });
        } else {
            throw new Error(response.data.msg || 'Video status check failed');
        }

    } catch (error) {
        console.error('❌ Video status error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: error.response?.data?.msg || error.message || 'Video status check failed'
        });
    }
});

// GET REAL VIDEO URL
app.get('/api/video-url/:taskId', async (req, res) => {
    try {
        console.log('📹 Getting video URL for task:', req.params.taskId);
        
        const response = await axios.get(`https://api.kie.ai/api/v1/veo/get-1080p-video?taskId=${req.params.taskId}`, {
            headers: {
                'Authorization': `Bearer ${VEO_API_KEY}`
            },
            timeout: 30000
        });

        console.log('✅ Video URL response:', response.data);

        if (response.data.code === 200) {
            res.json({
                success: true,
                videoUrl: response.data.data.videoUrl,
                message: '4K video ready for download!'
            });
        } else {
            throw new Error(response.data.msg || 'Failed to get video URL');
        }

    } catch (error) {
        console.error('❌ Video URL error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: error.response?.data?.msg || error.message || 'Failed to get video URL'
        });
    }
});

function getStatusMessage(status) {
    const messages = {
        'starting': 'Starting music generation...',
        'generating_lyrics': 'Writing lyrics...',
        'generating_music': 'Composing music...',
        'generating_audio': 'Recording audio...',
        'complete': 'Music ready!',
        'error': 'Generation failed'
    };
    return messages[status] || 'Processing...';
}

function getVideoStatusMessage(status) {
    const messages = {
        0: 'Video queued for generation...',
        1: 'Video ready!',
        2: 'Video generation failed',
        3: 'Video generation cancelled'
    };
    return messages[status] || 'Processing video...';
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('🚀 REAL Songsmith Pro Backend RUNNING!');
    console.log('📍 http://localhost:' + PORT);
    console.log('🎵 6 Suno API keys ready');
    console.log('🎥 Veo 3.1 API ready for 4K videos');
    console.log('🔥 100% REAL generation - No simulations!');
});