import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
// @ts-expect-error no types
import DarkTheme from '@blockly/theme-dark';
import type { ThemeType } from '@iobroker/adapter-react-v5';

interface AiBlocklyPreviewProps {
    xml: string;
    themeType: ThemeType;
}

const AiBlocklyPreview: React.FC<AiBlocklyPreviewProps> = ({ xml, themeType }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const workspaceRef = useRef<any>(null);
    const [dynamicHeight, setDynamicHeight] = useState(60);
    const resizePending = useRef(false);

    useEffect(() => {
        if (resizePending.current) {
            resizePending.current = false;
            requestAnimationFrame(() => {
                const Blockly = (window as any).Blockly;
                const ws = workspaceRef.current;
                if (Blockly && ws) {
                    Blockly.svgResize(ws);
                    ws.scrollCenter();
                }
            });
        }
    }, [dynamicHeight]);

    useEffect(() => {
        const Blockly = (window as any).Blockly;
        if (!Blockly || !containerRef.current) {
            return;
        }

        if (workspaceRef.current) {
            workspaceRef.current.dispose();
            workspaceRef.current = null;
        }

        try {
            const workspace = Blockly.inject(containerRef.current, {
                readOnly: true,
                toolbox: null as any,
                trashcan: false,
                zoom: { controls: false, wheel: false, startScale: 1.0 },
                move: { scrollbars: false, drag: false, wheel: false },
                sounds: false,
                renderer: 'thrasos',
                theme: themeType === 'dark' ? DarkTheme : 'classic',
                media: 'google-blockly/media/',
            });

            workspaceRef.current = workspace;

            let fullXml = xml.trim();
            if (!fullXml.startsWith('<xml')) {
                fullXml = `<xml xmlns="https://developers.google.com/blockly/xml">${fullXml}</xml>`;
            }

            const dom = Blockly.utils.xml.textToDom(fullXml);
            Blockly.Xml.domToWorkspace(dom, workspace);

            // Measure content bounding box
            const metrics = workspace.getBlocksBoundingBox();
            if (metrics) {
                const contentHeight = metrics.bottom - metrics.top + 20;
                const newHeight = Math.max(60, Math.ceil(contentHeight));
                resizePending.current = true;
                setDynamicHeight(newHeight);
            }
        } catch (e) {
            console.error('AiBlocklyPreview: Error rendering XML:', e);
        }

        return () => {
            if (workspaceRef.current) {
                workspaceRef.current.dispose();
                workspaceRef.current = null;
            }
        };
    }, [xml, themeType]);

    return (
        <Box
            ref={containerRef}
            sx={{
                width: '100%',
                height: dynamicHeight,
                minHeight: 60,
                borderRadius: 1,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
            }}
        />
    );
};

export default AiBlocklyPreview;
