import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    const decorationTypes: { [key: string]: vscode.TextEditorDecorationType } = {};
    const keywords: { [key: string]: string } = vscode.workspace.getConfiguration('highlightComments').get('keywords') || {
        "TODO": "rgba(255, 165, 0, 0.5)",  // Оранжевый
        "FIXME": "rgba(255, 69, 0, 0.5)",  // Красный
        "NOTE": "rgba(50, 205, 50, 0.5)"   // Зеленый
    };

    // Создаем декораторы для каждого ключевого слова
    Object.keys(keywords).forEach(keyword => {
        decorationTypes[keyword] = vscode.window.createTextEditorDecorationType({
            backgroundColor: keywords[keyword],
            borderRadius: '3px'
        });
    });

    const updateDecorations = (editor: vscode.TextEditor) => {
        if (!editor) return;

        const text = editor.document.getText();
        const decorations: { [key: string]: vscode.DecorationOptions[] } = {};

        // Инициализируем массивы декораций для каждого ключевого слова
        Object.keys(decorationTypes).forEach(keyword => decorations[keyword] = []);

        // Ищем ключевые слова в тексте
        const regex = new RegExp(`\\b(${Object.keys(decorationTypes).join('|')})\\b`, 'g');
        let match;
        while ((match = regex.exec(text))) {
            const startPos = editor.document.positionAt(match.index);
            const endPos = editor.document.positionAt(match.index + match[0].length);
            const decoration = { range: new vscode.Range(startPos, endPos) };
            decorations[match[0]].push(decoration);
        }

        // Обновляем декорации в редакторе
        Object.keys(decorations).forEach(keyword => {
            editor.setDecorations(decorationTypes[keyword], decorations[keyword]);
        });
    };

    const activeEditor = vscode.window.activeTextEditor;

    if (activeEditor) {
        updateDecorations(activeEditor);
    }

    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            updateDecorations(editor);
        }
    }, null, context.subscriptions);

    vscode.workspace.onDidChangeTextDocument(event => {
        if (vscode.window.activeTextEditor && event.document === vscode.window.activeTextEditor.document) {
            updateDecorations(vscode.window.activeTextEditor);
        }
    }, null, context.subscriptions);
}

export function deactivate() {}
