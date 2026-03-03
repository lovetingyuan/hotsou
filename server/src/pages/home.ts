export const getHomeHtml = (downloadUrl: string) => `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hotsou - 快速浏览各大热搜</title>
    <meta name="description" content="Hotsou App 官方下载。浏览各大热搜，同时也是一个站点管理工具。">
    <link rel="icon" type="image/png" href="/favicon.png">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg-color: #0b0f19;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --primary: #6366f1;
            --primary-hover: #4f46e5;
            --secondary: #ec4899;
            --glass-bg: rgba(255, 255, 255, 0.03);
            --glass-border: rgba(255, 255, 255, 0.08);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            background-color: var(--bg-color);
            color: var(--text-main);
            overflow-x: hidden;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
        }

        /* Ambient Glow Effects */
        .ambient-glow-1 {
            position: fixed;
            width: 700px;
            height: 700px;
            background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 60%);
            top: -200px;
            left: -200px;
            border-radius: 50%;
            z-index: -1;
            filter: blur(60px);
            animation: pulse 12s infinite alternate ease-in-out;
        }

        .ambient-glow-2 {
            position: fixed;
            width: 600px;
            height: 600px;
            background: radial-gradient(circle, rgba(236,72,153,0.1) 0%, rgba(0,0,0,0) 60%);
            bottom: -100px;
            right: -100px;
            border-radius: 50%;
            z-index: -1;
            filter: blur(60px);
            animation: pulse-reverse 15s infinite alternate ease-in-out;
        }

        @keyframes pulse {
            0% { transform: scale(1) translate(0, 0); opacity: 0.8; }
            100% { transform: scale(1.1) translate(30px, 30px); opacity: 1; }
        }

        @keyframes pulse-reverse {
            0% { transform: scale(1) translate(0, 0); opacity: 0.8; }
            100% { transform: scale(1.2) translate(-30px, -20px); opacity: 1; }
        }

        /* Layout Container */
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 4rem 2rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
        }

        /* Header / Hero Section */
        .hero {
            text-align: center;
            margin-top: 2rem;
            margin-bottom: 5rem;
            animation: fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
            transform: translateY(20px);
        }



        .title {
            font-size: 4.5rem;
            font-weight: 800;
            margin-bottom: 1.25rem;
            background: linear-gradient(135deg, #ffffff 30%, #a5b4fc 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: -0.04em;
            line-height: 1.1;
        }

        .subtitle {
            font-size: 1.25rem;
            color: var(--text-muted);
            max-width: 540px;
            margin: 0 auto 2.5rem;
            font-weight: 400;
        }

        /* Action Buttons */
        .btn-group {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
        }

        .btn-primary {
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
            background: linear-gradient(135deg, var(--primary) 0%, #818cf8 100%);
            color: white;
            padding: 1rem 2.5rem;
            border-radius: 9999px;
            font-size: 1.125rem;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);
            border: 1px solid rgba(255,255,255,0.1);
            position: relative;
            overflow: hidden;
        }

        .btn-primary::after {
            content: '';
            position: absolute;
            top: 0; left: -100%;
            width: 50%; height: 100%;
            background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
            transform: skewX(-20deg);
            transition: all 0.6s ease;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 35px -5px rgba(99, 102, 241, 0.6);
        }

        .btn-primary:hover::after {
            left: 200%;
        }

        .btn-primary svg {
            width: 24px;
            height: 24px;
            transition: transform 0.3s ease;
        }

        .btn-primary:hover svg {
            transform: translateY(2px);
        }

        .btn-secondary {
            position: absolute;
            top: 2rem;
            right: 2rem;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(255, 255, 255, 0.05);
            color: var(--text-main);
            padding: 0.75rem 1.5rem;
            border-radius: 9999px;
            font-size: 1rem;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            z-index: 100;
        }

        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: translateY(-2px);
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
        }

        .btn-secondary svg {
            width: 20px;
            height: 20px;
        }

        /* Showcase Gallery */
        .showcase {
            display: flex;
            gap: 2.5rem;
            justify-content: center;
            align-items: center;
            width: 100%;
            perspective: 1200px;
            margin-top: 1rem;
        }

        .device {
            position: relative;
            width: 280px;
            height: 580px;
            border-radius: 44px;
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.6), inset 0 0 0 4px rgba(255,255,255,0.05);
            padding: 12px;
            backdrop-filter: blur(20px);
            transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            opacity: 0;
            transform: translateY(40px) rotateX(10deg);
            animation: fadeUpDevice 1s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        .device:nth-child(1) { animation-delay: 0.2s; z-index: 1; transform: translateY(0); }
        .device:nth-child(2) { animation-delay: 0.4s; z-index: 3; transform: translateY(-20px); }
        .device:nth-child(3) { animation-delay: 0.6s; z-index: 1; transform: translateY(0); }

        @keyframes fadeUp {
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeUpDevice {
            to { opacity: 1; transform: translateY(0) rotate(0); }
        }

        /* Hover effects removed as requested */


        .screen {
            width: 100%;
            height: 100%;
            border-radius: 32px;
            overflow: hidden;
            background: #000;
            position: relative;
        }

        .screen img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        @media (max-width: 1024px) {
            .title { font-size: 3.5rem; }
            .showcase {
                gap: 1.5rem;
            }
            .btn-secondary {
                top: 1rem;
                right: 1rem;
                padding: 0.5rem 1rem;
                font-size: 0.875rem;
            }
        }

        @media (max-width: 768px) {
            .container { padding: 3rem 1.5rem; }
            .hero { margin-top: 1rem; margin-bottom: 3rem; }
            .title { font-size: 2.75rem; }

            .showcase {
                flex-direction: column;
                align-items: center;
                gap: 2rem;
                margin-top: 0;
            }

            .device {
                width: 280px !important;
                height: 580px !important;
                margin: 0 !important;
                transform: translateY(0) rotate(0) !important;
                animation-name: fadeUp;
            }

            .device:nth-child(2) { transform: translateY(0) !important; }
        }
    </style>
</head>
<body>
    <a href="https://github.com/lovetingyuan/hotsou/" target="_blank" rel="noopener noreferrer" class="btn-secondary">
        <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"></path>
        </svg>
        GitHub
    </a>

    <div class="ambient-glow-1"></div>
    <div class="ambient-glow-2"></div>

    <main class="container">
        <header class="hero">
            <h1 class="title">HotSou</h1>
            <p class="subtitle">在一个APP中浏览各大主流媒体的新闻热搜，急速直达，方便快捷。</p>
            <div class="btn-group">
                <a href="${downloadUrl}" class="btn-primary">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    下载体验
                </a>
            </div>
        </header>

        <section class="showcase">
            <!-- Left Device -->
            <div class="device active-state">
                <div class="screen">
                    <img src="/1111.jpg" alt="Hotsou App 界面预览 1" loading="lazy">
                </div>
            </div>
            <!-- Center Device (Main) -->
            <div class="device active-state">
                <div class="screen">
                    <img src="/2222.jpg" alt="Hotsou App 核心功能展示" loading="lazy">
                </div>
            </div>
            <!-- Right Device -->
            <div class="device active-state">
                <div class="screen">
                    <img src="/3333.jpg" alt="Hotsou App 同步体验" loading="lazy">
                </div>
            </div>
        </section>
    </main>


</body>
</html>
`
