const buttonNumbers = document.querySelectorAll('.number');
const buttonOperators = document.querySelectorAll('.operator');
const buttonEqual = document.querySelector('.equal-sign');
const buttonBackspace = document.querySelector('.del');
const buttonClear = document.querySelector('.ac');

const previousExpression = document.getElementById('previous-expression');
const output = document.getElementById('output');

let number1 = null;
let operator = '';
let number2 = null;
let result = null;
let isContinueOperation = false;

updateScreenOutput('0', false);

document.addEventListener('keydown', handleKeyPress);

buttonNumbers.forEach((button) => {
    button.addEventListener('click', () => handleNumberClick(button.textContent));
});

buttonOperators.forEach((button) => {
    button.addEventListener('click', () => handleOperatorClick(button.textContent));
});

buttonEqual.addEventListener('click', () => handleEqualClick());

buttonBackspace.addEventListener('click', () => handleBackspaceClick());

buttonClear.addEventListener('click', () => reset());

function handleKeyPress(event) {
    const key = event.key;

    if (!isNaN(key)) {
        handleNumberClick(key);
    } else if (key === '.') {
        handleNumberClick('.');
    } else if (['+', '-', '*', '/'].includes(key)) {
        handleOperatorClick(key);
    } else if (key === '=' || key === 'Enter') {
        handleEqualClick();
    } else if (key === 'Backspace') {
        handleBackspaceClick();
    } else if (key === 'Escape') {
        reset();
    }
}

function handleNumberClick(number) {
    if (!operator) {
        if (previousExpression.textContent) {
            previousExpression.textContent = '';

            if (number === '.') {
                updateScreenOutput('0' + number, false);
            } else {
                updateScreenOutput(number, false);
            }

            number1 = parseFloat(output.textContent);
            return;
        }

        if (output.textContent.slice(0, 2) === '-0') {
            if (number === '0') {
                number1 = 0;
                return;
            }

            const newOutput = output.textContent.replace(/^-0/, `-${number}`);
            updateScreenOutput(newOutput, false);
            number1 = -0;
            return;
        }

        if (isFirstOutputDisplayZero()) {
            if (number === '.') {
                updateScreenOutput(number);
                number1 = parseFloat(output.textContent);
                return;
            }
            updateScreenOutput(number, false);
            number1 = parseFloat(output.textContent);
            return;
        }

        if (number === '.') {
            for (let char of output.textContent) {
                if (char === '.') {
                    return;
                }
            }
            updateScreenOutput(number);
            return;
        }

        updateScreenOutput(number);
        number1 = parseFloat(output.textContent);
    } else {
        if (isFirstOutputDisplayZero()) {
            updateScreenOutput(number, false);
            return;
        }

        if (number === '.' && output.textContent.slice(-1) === operator) {
            updateScreenOutput('0' + number);
            return;
        }

        if (number === '.') {
            const afterOperator = output.textContent.slice(output.textContent.lastIndexOf(operator));
            for (let char of afterOperator) {
                if (char === '.') {
                    return;
                }
            }
            updateScreenOutput(number);
            return;
        }

        if (output.textContent.slice(-2, -1) === operator && output.textContent.slice(-1) === '0') {
            if (number === '0') {
                return;
            }

            const newOutput = output.textContent.replace(/([-+*/])0$/, `$1${number}`);
            updateScreenOutput(newOutput, false);
            return;
        }

        updateScreenOutput(number);
        number2 = parseFloat(output.textContent.slice(output.textContent.lastIndexOf(operator) + 1));
    }
}

function handleOperatorClick(operatorText) {
    if (isButtonSubtract(operatorText) && isFirstOutputDisplayZero()) {
        updateScreenOutput(operatorText, false);
        return;
    }
    if (isFirstOutputDisplaySubtract() && isButtonSubtract(operatorText)) {
        return;
    }
    if (isFirstOutputDisplaySubtract()) {
        updateScreenOutput('0', false);
        return;
    }

    if ((operator === '*' || operator === '/') && operatorText === '-') {
        if (output.textContent.slice(-1) === '-') {
            return;
        }
        if (number2 < 0) {
            updateScreenOutput(operatorText);
        } else {
            updateScreenOutput(operatorText);
            return;
        }
    }

    if (/[-+*/]$/.test(output.textContent)) {
        const newOutput = output.textContent.replace(/([-+*/]{1,2})$/, operatorText);
        updateScreenOutput(newOutput, false);
    } else {
        updateScreenOutput(operatorText);
    }

    if (operator !== '' && number2 !== null) {
        isContinueOperation = true;
        result = operate(number1, operator, number2);
        previousExpression.textContent = number1 + operator + number2;
        number2 = null;
    }

    operator = operatorText;

    if (previousExpression.textContent || isContinueOperation) {
        number1 = result;
        updateScreenOutput(result + operator, false);
    }
}

function handleEqualClick() {
    if (!operator || number1 === null || number2 == null) {
        return;
    }

    result = operate(number1, operator, number2);
    previousExpression.textContent = output.textContent;
    updateScreenOutput(result, false);
    operator = '';
    number2 = null;
    isContinueOperation = false;
}

function handleBackspaceClick() {
    if (!previousExpression.textContent) {
        if (output.textContent.length === 1) {
            updateScreenOutput('0', false);
            return;
        }

        if (output.textContent.slice(-1) === operator) {
            operator = '';
        }

        const newOutput = output.textContent.slice(0, -1);
        updateScreenOutput(newOutput, false);

        if (operator) {
            const num2 = output.textContent.slice(output.textContent.lastIndexOf(operator) + 1);
            number2 = num2 ? parseFloat(num2) : null;
        } else {
            number1 = parseFloat(output.textContent);
        }
    } else if (operator && previousExpression.textContent) {
        const newOutput = output.textContent.slice(0, output.textContent.lastIndexOf(operator) + 1);
        updateScreenOutput(newOutput, false);

        const output2 = output.textContent.slice(output.textContent.lastIndexOf(operator) + 1);
        number2 = output2 ? parseFloat(output2) : null;
    }
}

function isButtonDecimalPoint(button) {
    return button === '.';
}

function isFirstOutputDisplayZero() {
    return output.textContent === '0';
}

function isFirstOutputDisplaySubtract() {
    return output.textContent === '-';
}

function isButtonSubtract(button) {
    return button === '-';
}

function operate(n1, operator, n2) {
    switch (operator) {
        case '+':
            return n1 + n2;
        case '-':
            return n1 - n2;
        case '*':
            return n1 * n2;
        case '/':
            if (n2 === 0) {
                return 'Error: Divide by Zero';
            }
            return n1 / n2;
    }
}

function updateScreenOutput(text, notReset = true) {
    if (notReset) {
        output.textContent += text;
    } else {
        output.textContent = text;
    }
}

function reset() {
    number1 = 0;
    operator = '';
    number2 = 0;
    result = 0;
    isContinueOperation = false;
    updateScreenOutput('0', false);
    previousExpression.textContent = '';
}
