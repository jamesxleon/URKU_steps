import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Game.css';

interface Avatar {
    x: number;
    y: number;
    width: number;
    height: number;
    dx: number;
    dy: number;
    gravity: number;
    jumpPower: number;
    onGround: boolean;
}

interface Obstacle {
    x: number;
    y: number;
    width: number;
    height: number;
    image: HTMLImageElement;
}

const Game: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const avatarRef = useRef<Avatar>({
        x: 0,
        y: 500,
        width: 150,
        height: 150,
        dx: 5,
        dy: 0,
        gravity: 0.5,
        jumpPower: -10,
        onGround: false,
    });
    const obstaclesRef = useRef<Obstacle[]>([]);
    const goalRef = useRef({ x: 1000, y: 200, width: 150, height: 150 });
    const keys = useRef<{ [key: string]: boolean }>({});
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [showGoalMessage, setShowGoalMessage] = useState(false);
    const navigate = useNavigate();

    const avatarImg = new Image();
    avatarImg.src = '/images/avatar.png';

    const goalImg = new Image();
    goalImg.src = '/images/goal.png';

    useEffect(() => {
        const platformImagesSrc = ['/images/mountain.png', '/images/mountain_1.png', '/images/mountain_3.png'];
        const platformImages = platformImagesSrc.map(src => {
            const img = new Image();
            img.src = src;
            return img;
        });

        const loadImages = () => {
            let loaded = 0;
            const totalImages = platformImages.length + 2;
            platformImages.forEach(img => img.onload = () => { if (++loaded === totalImages) setImagesLoaded(true); });
            avatarImg.onload = () => { if (++loaded === totalImages) setImagesLoaded(true); };
            goalImg.onload = () => { if (++loaded === totalImages) setImagesLoaded(true); };
        };
        loadImages();

        obstaclesRef.current = [
            { x: 150, y: 600, width: 150, height: 250, image: platformImages[0] },
            { x: 350, y: 500, width: 150, height: 300, image: platformImages[1] },
            { x: 600, y: 400, width: 150, height: 450, image: platformImages[2] },
            { x: 800, y: 100, width: 300, height: 900, image: platformImages[0] },
        ];

    }, []);

    useEffect(() => {
        if (imagesLoaded) {
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) gameLoop(ctx);
            }
        }
    }, [imagesLoaded]);

    const gameLoop = (ctx: CanvasRenderingContext2D) => {
        const avatar = avatarRef.current;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        avatar.dy += avatar.gravity;
        avatar.y += avatar.dy;

        obstaclesRef.current.forEach(obstacle => {
            if (
                avatar.x < obstacle.x + obstacle.width &&
                avatar.x + avatar.width > obstacle.x &&
                avatar.y + avatar.height > obstacle.y &&
                avatar.y + avatar.dy >= obstacle.y
            ) {
                avatar.y = obstacle.y - avatar.height;
                avatar.dy = 0;
                avatar.onGround = true;
            }
        });

        if (avatar.y + avatar.height >= ctx.canvas.height) {
            avatar.y = ctx.canvas.height - avatar.height;
            avatar.dy = 0;
            avatar.onGround = true;
        } else {
            avatar.onGround = false;
        }

        const goal = goalRef.current;
        if (
            avatar.x < goal.x + goal.width &&
            avatar.x + avatar.width > goal.x &&
            avatar.y < goal.y + goal.height &&
            avatar.y + avatar.height > goal.y
        ) {
            setShowGoalMessage(true);
        }

        if (keys.current['ArrowRight']) avatar.x += avatar.dx;
        if (keys.current['ArrowLeft']) avatar.x -= avatar.dx;
        if (keys.current['ArrowUp'] && avatar.onGround) avatar.dy = avatar.jumpPower;

        draw(ctx);
        requestAnimationFrame(() => gameLoop(ctx));
    };

    const draw = (ctx: CanvasRenderingContext2D) => {
        ctx.drawImage(avatarImg, avatarRef.current.x, avatarRef.current.y, avatarRef.current.width, avatarRef.current.height);

        obstaclesRef.current.forEach(obstacle => {
            ctx.drawImage(obstacle.image, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        });

        ctx.drawImage(goalImg, goalRef.current.x, goalRef.current.y, goalRef.current.width, goalRef.current.height);
    };

    const resetGame = () => {
        const avatar = avatarRef.current;
        avatar.x = 50;
        avatar.y = 500;
        avatar.dy = 0;
        setShowGoalMessage(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => { keys.current[e.key] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keys.current[e.key] = false; };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    return (
        <div className="game-container">
            <div className="motivational-label">
                The only mountains that stop you are the ones you don't climb
            </div>
            <div className="instructions">
                Use the arrow keys to start your journey!
            </div>
            <canvas ref={canvasRef} width="1200" height="800" />
            {showGoalMessage && (
                <div className="goal-message">
                    <p>Congratulations! You've overcome the obstacles!</p>
                    <button onClick={() => navigate('/home')}>Start a New Journey</button>
                </div>
            )}
        </div>
    );
};

export default Game;
