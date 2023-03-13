import { useCallback, useEffect, useState, useRef } from "react";
import styled from "styled-components";
import Canvas from "./Canvas";
import LeftBar from "./LeftBar";
import { INITIAL_POSITION, INITIAL_SIZE } from "./defaults";

function Main() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(new Image());
    const [canvasSize, setCanvasSize] = useState(INITIAL_SIZE);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
    const [tool, setTool] = useState<Tool>("select");
    const [reset, setReset] = useState(false);
    const scaleRef = useRef(1);
    const viewPosRef = useRef(INITIAL_POSITION);

    // init
    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        canvas.width = canvasSize.width;
        canvas.height = canvasSize.height;
        const context = canvas.getContext("2d");
        setCtx(context);
    }, [canvasSize]);

    const draw = useCallback(() => {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
        ctx.setTransform(scaleRef.current, 0, 0, scaleRef.current, viewPosRef.current.x, viewPosRef.current.y);
        ctx.drawImage(imageRef.current, 0, 0, canvasSize.width, canvasSize.height);
    }, [ctx, canvasSize]);

    // draw init
    useEffect(() => {
        const img = imageRef.current;
        img.src = "https://s3.marpple.co/files/u_218933/2020/1/original/14474423ccd1acb63fab43dc936ab01302c64b547577e2e.png";
        img.onload = () => {
            draw();
        };
    }, [draw]);

    const updateCanvasSize = useCallback(({ width, height }: Size) => {
        setCanvasSize({ width, height });
    }, []);

    const setScaleRef = useCallback((value: number) => {
        scaleRef.current = value;
    }, []);

    const setViewPosRef = useCallback(({ x, y }: Position) => {
        viewPosRef.current = {
            x,
            y,
        };
    }, []);

    const handleToolChange = useCallback((newTool: Tool) => {
        setTool(newTool);
    }, []);
    const setIsReset = useCallback((isReset: boolean) => {
        setReset(isReset);
    }, []);

    return (
        <StyledMain>
            <LeftBar tool={tool} onToolChange={handleToolChange} setIsReset={setIsReset} />
            <Canvas
                canvasRef={canvasRef}
                imageRef={imageRef}
                ctx={ctx}
                tool={tool}
                reset={reset}
                setIsReset={setIsReset}
                scaleRef={scaleRef}
                setScaleRef={setScaleRef}
                viewPosRef={viewPosRef}
                setViewPosRef={setViewPosRef}
                updateCanvasSize={updateCanvasSize}
                draw={draw}
            />
        </StyledMain>
    );
}
export default Main;

const StyledMain = styled.main`
    display: flex;
    height: calc(100% - 48px);
`;
