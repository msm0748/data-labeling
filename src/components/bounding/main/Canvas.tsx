import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { INITIAL_SIZE, INITIAL_POSITION } from "./defaults";

interface Props {
    reset: boolean;
    setIsReset: (isReset: boolean) => void;
}

const StyledWrapper = styled.div`
    flex: 1;
`;

const MIN_SCALE = 0.1;
const MAX_SCALE = 10;

function Canvas({ reset, setIsReset }: Props) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement>(new Image());
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
    const [canvasSize, setCanvasSize] = useState(INITIAL_SIZE);
    const isTouchRef = useRef(false);
    const viewPosRef = useRef(INITIAL_POSITION);
    const startPosRef = useRef(INITIAL_POSITION);
    const scaleRef = useRef(1);

    // init
    useEffect(() => {
        if (!wrapperRef.current || !canvasRef.current) return;
        const width = wrapperRef.current.offsetWidth;
        const height = wrapperRef.current.offsetHeight;
        setCanvasSize({ width, height });
        const canvas = canvasRef.current;
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        setCtx(context);
    }, []);

    const draw = useCallback(() => {
        if (!ctx) return;
        ctx.canvas.width = canvasSize.width;
        ctx.setTransform(scaleRef.current, 0, 0, scaleRef.current, viewPosRef.current.x, viewPosRef.current.y);
        ctx.drawImage(imgRef.current, 0, 0, canvasSize.width, canvasSize.height);
    }, [ctx, canvasSize]);

    const resetCanvas = useCallback(() => {
        if (!ctx) return;
        scaleRef.current = 1;
        isTouchRef.current = false;
        viewPosRef.current = INITIAL_POSITION;
        startPosRef.current = INITIAL_POSITION;
        draw();
    }, [ctx, draw]);

    // reset
    useEffect(() => {
        const img = imgRef.current;
        img.src = "https://s3.marpple.co/files/u_218933/2020/1/original/14474423ccd1acb63fab43dc936ab01302c64b547577e2e.png";
        img.onload = function () {
            resetCanvas();
        };
        setIsReset(false);
    }, [resetCanvas, reset, setIsReset]);

    const handleMouseDown = (e: React.MouseEvent) => {
        const { offsetX, offsetY } = e.nativeEvent;

        startPosRef.current = {
            x: offsetX - viewPosRef.current.x,
            y: offsetY - viewPosRef.current.y,
        };

        isTouchRef.current = true;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const { offsetX, offsetY } = e.nativeEvent;

        if (isTouchRef.current) {
            viewPosRef.current = {
                x: offsetX - startPosRef.current.x,
                y: offsetY - startPosRef.current.y,
            };
        }

        draw();
    };

    const handleMouseUp = () => {
        isTouchRef.current = false;
    };

    const handleWheel = (e: React.WheelEvent) => {
        const { offsetX, offsetY } = e.nativeEvent;

        const xs = (offsetX - viewPosRef.current.x) / scaleRef.current;
        const ys = (offsetY - viewPosRef.current.y) / scaleRef.current;

        const delta = -e.deltaY;
        const ZOOM_SENSITIVITY = 1.025;

        if (delta > 0 && scaleRef.current < MAX_SCALE) {
            scaleRef.current *= ZOOM_SENSITIVITY;
        } else if (delta < 0 && scaleRef.current > MIN_SCALE) {
            scaleRef.current /= ZOOM_SENSITIVITY;
        }

        viewPosRef.current = {
            x: offsetX - xs * scaleRef.current,
            y: offsetY - ys * scaleRef.current,
        };

        draw();
    };

    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const preventDefault = (e: WheelEvent) => {
            if (e.ctrlKey) {
                e.preventDefault();
            }
        };
        canvas.addEventListener("wheel", preventDefault, { passive: false });
        return () => {
            canvas.removeEventListener("wheel", preventDefault);
        };
    }, []);

    return (
        <StyledWrapper ref={wrapperRef}>
            <canvas ref={canvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onWheel={handleWheel}></canvas>
        </StyledWrapper>
    );
}

export default Canvas;