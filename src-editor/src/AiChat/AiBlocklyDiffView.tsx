import React, { useEffect, useRef } from 'react';
import { Box, Button, Toolbar, Typography } from '@mui/material';
import { Check, Close } from '@mui/icons-material';
// @ts-expect-error no types
import DarkTheme from '@blockly/theme-dark';
import { I18n, type ThemeType } from '@iobroker/adapter-react-v5';

interface AiBlocklyDiffViewProps {
    originalXml: string;
    modifiedXml: string;
    themeType: ThemeType;
    onAccept: (xml: string) => void;
    onReject: () => void;
}

/** Create a fingerprint for a single block (type + own fields, ignoring children) */
function blockFingerprint(block: any): string {
    const Blockly = (window as any).Blockly;
    if (!Blockly) {
        return '';
    }
    const type: string = block.type || '';
    const parts: string[] = [];
    // Collect all field values and input names on this block
    for (const input of block.inputList || []) {
        parts.push(`in:${input.name || ''}`);
        for (const field of input.fieldRow || []) {
            if (field.name && field.getValue) {
                parts.push(`${field.name}=${field.getValue()}`);
            }
        }
    }
    // Include mutation data (e.g. items count for on_ext)
    if (block.mutationToDom) {
        try {
            const mutation = block.mutationToDom();
            if (mutation) {
                parts.push(`mut:${mutation.outerHTML}`);
            }
        } catch {
            /* ignore */
        }
    }
    return `${type}|${parts.join(',')}`;
}

/** Deep fingerprint: this block + input-connected children recursively (NOT next-siblings) */
function deepFingerprint(block: any): string {
    const self = blockFingerprint(block);
    const childParts: string[] = [];
    for (const input of block.inputList || []) {
        const conn = input.connection;
        if (conn) {
            const target = conn.targetBlock();
            if (target) {
                childParts.push(deepFingerprint(target));
            }
        }
    }
    return childParts.length > 0 ? `${self}[${childParts.join(';')}]` : self;
}

/** Collect fingerprints from a workspace */
function collectFingerprints(workspace: any): { deep: Map<string, number>; type: Map<string, number> } {
    const deep = new Map<string, number>();
    const type = new Map<string, number>();
    for (const block of workspace.getAllBlocks(false)) {
        const dfp = deepFingerprint(block);
        deep.set(dfp, (deep.get(dfp) || 0) + 1);
        const t: string = block.type || '';
        type.set(t, (type.get(t) || 0) + 1);
    }
    return { deep, type };
}

/**
 * Classify each block as:
 * - 'unchanged': identical block exists on other side → fade
 * - 'modified': same block type exists but different fields → full opacity, no border
 * - 'new': block type doesn't exist on other side at all → border highlight
 */
function applyDiffStyling(
    workspace: any,
    otherFps: { deep: Map<string, number>; type: Map<string, number> },
    side: 'original' | 'modified',
): void {
    const deepRemaining = new Map(otherFps.deep);
    const typeRemaining = new Map(otherFps.type);
    const allBlocks = workspace.getAllBlocks(false);
    const color = side === 'original' ? '#ef5350' : '#66bb6a';

    // Classify each block using deep fingerprint (includes children)
    const status = new Map<string, 'unchanged' | 'modified' | 'new'>();
    for (const block of allBlocks) {
        const dfp = deepFingerprint(block);
        const deepCount = deepRemaining.get(dfp) || 0;
        if (deepCount > 0) {
            deepRemaining.set(dfp, deepCount - 1);
            const t: string = block.type || '';
            typeRemaining.set(t, (typeRemaining.get(t) || 0) - 1);
            status.set(block.id, 'unchanged');
        } else {
            const t: string = block.type || '';
            const typeCount = typeRemaining.get(t) || 0;
            if (typeCount > 0) {
                typeRemaining.set(t, typeCount - 1);
                status.set(block.id, 'modified');
            } else {
                status.set(block.id, 'new');
            }
        }
    }

    // Propagate 'new' to input-connected children only (NOT next-connected siblings)
    function propagateNew(block: any): void {
        for (const input of block.inputList || []) {
            const conn = input.connection;
            if (conn) {
                const target = conn.targetBlock();
                if (target) {
                    status.set(target.id, 'new');
                    propagateNew(target);
                }
            }
        }
    }
    for (const block of allBlocks) {
        if (status.get(block.id) !== 'new') {
            continue;
        }
        propagateNew(block);
    }

    for (const block of allBlocks) {
        const s = status.get(block.id);
        const svgRoot = block.getSvgRoot();
        if (!svgRoot) {
            continue;
        }

        if (s === 'unchanged') {
            const pathEl = svgRoot.querySelector('.blocklyPath') as SVGPathElement | null;
            if (pathEl) {
                const overlay = pathEl.cloneNode(false) as SVGPathElement;
                overlay.setAttribute('fill', '#ffffff');
                overlay.setAttribute('fill-opacity', '0.7');
                overlay.setAttribute('stroke', 'none');
                overlay.removeAttribute('filter');
                // Insert after the path so it covers it
                pathEl.parentNode?.insertBefore(overlay, pathEl.nextSibling);
            }
        } else if (s === 'new') {
            // Add colored rect border - only on the outermost new block
            const parent = block.getParent();
            if (parent && status.get(parent.id) === 'new') {
                continue;
            }
            try {
                // Blocks with input-children: use getHeightWidth (includes children)
                // Leaf blocks / blocks with only next: use path bbox (own size only)
                const hasInputChildren = (block.inputList || []).some(
                    (inp: any) => inp.connection && inp.connection.targetBlock(),
                );
                let bx: number, by: number, bw: number, bh: number;
                if (hasInputChildren) {
                    const hw = block.getHeightWidth();
                    bx = 0;
                    by = 0;
                    bw = hw.width;
                    bh = hw.height;
                } else {
                    const pathEl = svgRoot.querySelector('.blocklyPath') as SVGGraphicsElement | null;
                    const bbox = pathEl?.getBBox() || { x: 0, y: 0, width: 100, height: 30 };
                    bx = bbox.x;
                    by = bbox.y;
                    bw = bbox.width;
                    bh = bbox.height;
                }
                const highlight = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                highlight.setAttribute('x', String(bx - 4));
                highlight.setAttribute('y', String(by - 4));
                highlight.setAttribute('width', String(bw + 8));
                highlight.setAttribute('height', String(bh + 8));
                highlight.setAttribute('rx', '8');
                highlight.setAttribute('fill', color);
                highlight.setAttribute('fill-opacity', '0.08');
                highlight.setAttribute('stroke', color);
                highlight.setAttribute('stroke-width', '2.5');
                highlight.setAttribute('pointer-events', 'none');
                if (side === 'original') {
                    highlight.setAttribute('stroke-dasharray', '6,3');
                }
                svgRoot.appendChild(highlight);
            } catch {
                /* ignore */
            }
        }
        // 'modified' blocks: no styling, just full visibility
    }
}

function injectWorkspace(container: HTMLDivElement, xmlStr: string, themeType: ThemeType): any {
    const Blockly = (window as any).Blockly;
    if (!Blockly) {
        return null;
    }

    const workspace = Blockly.inject(container, {
        readOnly: true,
        toolbox: null as any,
        trashcan: false,
        zoom: { controls: false, wheel: true, startScale: 0.85 },
        move: { scrollbars: true, drag: true, wheel: true },
        sounds: false,
        renderer: 'thrasos',
        theme: themeType === 'dark' ? DarkTheme : 'classic',
        media: 'google-blockly/media/',
    });

    try {
        let fullXml = xmlStr.trim();
        if (!fullXml.startsWith('<xml')) {
            fullXml = `<xml xmlns="https://developers.google.com/blockly/xml">${fullXml}</xml>`;
        }
        const dom = Blockly.utils.xml.textToDom(fullXml);
        Blockly.Xml.domToWorkspace(dom, workspace);
        workspace.scrollCenter();
    } catch (e) {
        console.error('AiBlocklyDiffView: Error rendering XML:', e);
    }

    return workspace;
}

const AiBlocklyDiffView: React.FC<AiBlocklyDiffViewProps> = ({
    originalXml,
    modifiedXml,
    themeType,
    onAccept,
    onReject,
}) => {
    const leftRef = useRef<HTMLDivElement>(null);
    const rightRef = useRef<HTMLDivElement>(null);
    const leftWsRef = useRef<any>(null);
    const rightWsRef = useRef<any>(null);

    useEffect(() => {
        if (leftWsRef.current) {
            leftWsRef.current.dispose();
            leftWsRef.current = null;
        }
        if (rightWsRef.current) {
            rightWsRef.current.dispose();
            rightWsRef.current = null;
        }

        if (!leftRef.current || !rightRef.current) {
            return;
        }

        const leftWs = injectWorkspace(leftRef.current, originalXml, themeType);
        const rightWs = injectWorkspace(rightRef.current, modifiedXml, themeType);
        leftWsRef.current = leftWs;
        rightWsRef.current = rightWs;

        // Apply diff styling after render
        requestAnimationFrame(() => {
            if (leftWs && rightWs) {
                const leftFps = collectFingerprints(leftWs);
                const rightFps = collectFingerprints(rightWs);
                applyDiffStyling(leftWs, rightFps, 'original');
                applyDiffStyling(rightWs, leftFps, 'modified');
            }
        });

        return () => {
            if (leftWsRef.current) {
                leftWsRef.current.dispose();
                leftWsRef.current = null;
            }
            if (rightWsRef.current) {
                rightWsRef.current.dispose();
                rightWsRef.current = null;
            }
        };
    }, [originalXml, modifiedXml, themeType]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
            <Toolbar
                variant="dense"
                sx={{
                    minHeight: 36,
                    bgcolor: 'background.paper',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    gap: 1,
                    flexShrink: 0,
                }}
            >
                <Typography
                    variant="subtitle2"
                    sx={{ flex: 1 }}
                >
                    {I18n.t('AI suggested changes')}
                </Typography>
                <Button
                    variant="contained"
                    color="success"
                    size="small"
                    startIcon={<Check />}
                    onClick={() => onAccept(modifiedXml)}
                >
                    {I18n.t('Accept')}
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<Close />}
                    onClick={onReject}
                >
                    {I18n.t('Reject')}
                </Button>
            </Toolbar>
            <Box sx={{ flex: 1, display: 'flex', gap: 0, overflow: 'hidden' }}>
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: 0,
                        borderRight: '2px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{
                            px: 1,
                            py: 0.25,
                            fontWeight: 600,
                            color: 'error.main',
                            bgcolor: 'action.hover',
                            flexShrink: 0,
                        }}
                    >
                        {I18n.t('Current blocks')}
                    </Typography>
                    <Box
                        ref={leftRef}
                        sx={{ flex: 1 }}
                    />
                </Box>
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <Typography
                        variant="caption"
                        sx={{
                            px: 1,
                            py: 0.25,
                            fontWeight: 600,
                            color: 'success.main',
                            bgcolor: 'action.hover',
                            flexShrink: 0,
                        }}
                    >
                        {I18n.t('New blocks')}
                    </Typography>
                    <Box
                        ref={rightRef}
                        sx={{ flex: 1 }}
                    />
                </Box>
            </Box>
        </Box>
    );
};

export default AiBlocklyDiffView;
