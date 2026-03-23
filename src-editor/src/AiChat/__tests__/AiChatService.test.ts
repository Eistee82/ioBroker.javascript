import { describe, it, expect } from 'vitest';
import { stripThinkingArtifacts, extractCode, parseCodeBlocks, getBlocklyCodeModeSystemPrompt } from '../AiChatService';

describe('stripThinkingArtifacts', () => {
    it('should strip <think> tags', () => {
        const input = '<think>Let me think about this...</think>Here is the answer.';
        expect(stripThinkingArtifacts(input)).toBe('Here is the answer.');
    });

    it('should strip <|endoftext|>', () => {
        const input = 'Some code here<|endoftext|>';
        expect(stripThinkingArtifacts(input)).toBe('Some code here');
    });

    it('should strip <|im_start|>...<|im_end|>', () => {
        const input = 'Code<|im_start|>system\nYou are...<|im_end|>More code';
        expect(stripThinkingArtifacts(input)).toBe('CodeMore code');
    });

    it('should strip trailing <|im_start|> without end', () => {
        const input = 'Code<|im_start|>remaining garbage';
        expect(stripThinkingArtifacts(input)).toBe('Code');
    });

    it('should handle clean input', () => {
        const input = 'Just normal text';
        expect(stripThinkingArtifacts(input)).toBe('Just normal text');
    });
});

describe('extractCode', () => {
    it('should extract code from markdown fences', () => {
        const input = 'Here is the code:\n```javascript\nsetState("dp.0.val", true);\n```\nDone.';
        expect(extractCode(input)).toBe('setState("dp.0.val", true);');
    });

    it('should extract code from typescript fences', () => {
        const input = '```ts\nconst x: number = 5;\n```';
        expect(extractCode(input)).toBe('const x: number = 5;');
    });

    it('should detect code without fences', () => {
        const input = "Here is the solution:\n\non('dp.0.state', (obj) => {\n    log(obj.state.val);\n});";
        const result = extractCode(input);
        expect(result).toContain("on('dp.0.state'");
        expect(result).toContain('log(obj.state.val)');
    });

    it('should strip thinking artifacts before extracting', () => {
        const input = '<think>Planning...</think>\n```javascript\nlog("hello");\n```';
        expect(extractCode(input)).toBe('log("hello");');
    });

    it('should handle empty input', () => {
        expect(extractCode('')).toBe('');
    });
});

describe('parseCodeBlocks', () => {
    it('should parse single code block', () => {
        const input = 'Some text\n```javascript\nlog("test");\n```\nMore text';
        const blocks = parseCodeBlocks(input);
        expect(blocks).toHaveLength(1);
        expect(blocks[0].language).toBe('javascript');
        expect(blocks[0].code).toBe('log("test");');
    });

    it('should parse multiple code blocks', () => {
        const input = '```js\nconst a = 1;\n```\n\n```typescript\nconst b: number = 2;\n```';
        const blocks = parseCodeBlocks(input);
        expect(blocks).toHaveLength(2);
        expect(blocks[0].language).toBe('js');
        expect(blocks[1].language).toBe('typescript');
    });

    it('should handle no code blocks', () => {
        const blocks = parseCodeBlocks('Just plain text without code');
        expect(blocks).toHaveLength(0);
    });

    it('should default to javascript for blocks without language', () => {
        const input = '```\nlog("hi");\n```';
        const blocks = parseCodeBlocks(input);
        expect(blocks).toHaveLength(1);
        expect(blocks[0].language).toBe('javascript');
    });

    it('should parse xml code blocks', () => {
        const input =
            'Here are the blocks:\n```xml\n<block type="on_ext"><field name="CONDITION">ne</field></block>\n```\nDone.';
        const blocks = parseCodeBlocks(input);
        expect(blocks).toHaveLength(1);
        expect(blocks[0].language).toBe('xml');
        expect(blocks[0].code).toContain('block type="on_ext"');
    });
});

describe('getBlocklyCodeModeSystemPrompt', () => {
    it('should return a prompt string containing Blockly XML templates', () => {
        const prompt = getBlocklyCodeModeSystemPrompt('German');
        expect(prompt).toContain('Blockly XML');
        expect(prompt).toContain('xml');
        expect(prompt).toContain('German');
    });

    it('should contain essential block types', () => {
        const prompt = getBlocklyCodeModeSystemPrompt('English');
        expect(prompt).toContain('on_ext');
        expect(prompt).toContain('schedule');
        expect(prompt).toContain('control');
        expect(prompt).toContain('get_value');
        expect(prompt).toContain('debug');
        expect(prompt).toContain('sendto_custom');
        expect(prompt).toContain('controls_if');
        expect(prompt).toContain('logic_compare');
        expect(prompt).toContain('math_number');
        expect(prompt).toContain('logic_boolean');
    });

    it('should contain Telegram sendTo pattern', () => {
        const prompt = getBlocklyCodeModeSystemPrompt('English');
        expect(prompt).toContain('telegram.0');
        expect(prompt).toContain('send');
    });

    it('should include the target language in the prompt', () => {
        const prompt = getBlocklyCodeModeSystemPrompt('French');
        expect(prompt).toContain('French');
    });

    it('should contain timeout block template', () => {
        const prompt = getBlocklyCodeModeSystemPrompt('English');
        expect(prompt).toContain('timeouts_settimeout');
    });
});
