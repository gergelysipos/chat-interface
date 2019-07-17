class Chat {
    elements = {
        messagesOuterWrapper: document.querySelector('.messages-outer-wrapper'),
        messagesListWrapper: document.querySelector('.messages-list-wrapper'),
        messagesWrapper: document.querySelector('.messages-wrapper'),
        messageWriteWrapper: document.querySelector('.message-write-wrapper'),
        writeMessageForm: document.querySelector('.message-write-wrapper form'),
        usernameInput: document.querySelector('.message-write-wrapper form .username-input'),
        messageInput: document.querySelector('.message-write-wrapper form .message-input'),
        textInput: document.querySelectorAll('.message-write-wrapper form input[type="text"]')
    };
    shadowVisibilityOffset = 50;
    server = 'http://185.13.90.140:8081';

    constructor() {
        // The socker server
        this.socket = io(this.server);

        // Send message on form submit
        this.elements.writeMessageForm.addEventListener('submit', ev => {
            ev.preventDefault();
        
            this.sendMessage();
        });

        // Set the top and bottom shadow visibility on scroll
        this.elements.messagesOuterWrapper.addEventListener('scroll', ev => {
            this.setShadowVisibility();
        });

        // Add input-focus class to wrapper on input focus
        [...this.elements.textInput].forEach(textInput => textInput.addEventListener('focus', ev => {
            this.elements.messageWriteWrapper.classList.add(Classes.INPUT_FOCUS);
        }));

        // Remove input-focus class from wrapper on input blur
        [...this.elements.textInput].forEach(textInput => textInput.addEventListener('blur', ev => {
            this.elements.messageWriteWrapper.classList.remove(Classes.INPUT_FOCUS);
        }));

        // Add or remove can-send class from wrapper on keyup
        [...this.elements.textInput].forEach(textInput => textInput.addEventListener('keyup', ev => {
            this.setCanSendClass();
        }));

        // Listen to message event to get messages
        this.socket.on('message', (messageData) => {
            this.getMessage(messageData);
        });

        // Set the top and bottom shadow visibility
        this.setShadowVisibility();
    }

    /**
     * Set the top and bottom shadow visibility
     */
    setShadowVisibility() {
        // Top shadow
        if (this.elements.messagesOuterWrapper.scrollTop <= this.shadowVisibilityOffset) {
            this.elements.messagesListWrapper.classList.remove(Classes.SHOW_TOP_SHADOW);
        } else {
            this.elements.messagesListWrapper.classList.add(Classes.SHOW_TOP_SHADOW);
        }

        // Bottom shadow
        if (this.elements.messagesOuterWrapper.scrollTop +  + this.elements.messagesOuterWrapper.clientHeight 
            >= this.elements.messagesOuterWrapper.scrollHeight - this.shadowVisibilityOffset) {
            this.elements.messagesListWrapper.classList.remove(Classes.SHOW_BOTTOM_SHADOW);
        } else {
            this.elements.messagesListWrapper.classList.add(Classes.SHOW_BOTTOM_SHADOW);
        }
    }

    /**
     * Add or remove can-send class from wrapper
     */
    setCanSendClass() {
        if (this.elements.usernameInput.value !== ''
            && this.elements.messageInput.value !== '') {
            this.elements.messageWriteWrapper.classList.add(Classes.CAN_SEND);
        } else {
            this.elements.messageWriteWrapper.classList.remove(Classes.CAN_SEND);
        }
    }

    /**
     * Send to message to server if the inputs are not empty and add the message template to the messages list
     */
    sendMessage() {
        if (this.elements.messageInput.value === '' || this.elements.usernameInput.value === '') {
            console.error('The message or username is empty');
            return;
        } else {
            // Create messageData object
            let messageData = {
                message: this.elements.messageInput.value, 
                user: this.elements.usernameInput.value 
            };
    
            // Send message to server
            this.socket.emit('message', messageData);
    
            // Generate message template and add to messages list
            this.generateMessageElement(messageData, Classes.SENT);
    
            // Clear the input value
            this.elements.messageInput.value = '';

            // Remove the can-send class from wrapper
            this.setCanSendClass();
        }
    }

    /**
     * Check if messageData is the right format and add the message template to the messages list
     * 
     * @param {Object} messageData - The data of message
     */
    getMessage(messageData) {
        // Generate message template and add to messages list
        this.generateMessageElement(messageData, Classes.RECEIVED);
    }

    /**
     * Create message template and add to the messages list
     * 
     * @param {Object} messageData - The data of message
     * @param {string} event - Type of the event [Classes.SENT|Classes.RECEIVED]
     */
    generateMessageElement(messageData, event) {
        // Check if there is no messageData or does not have properties
        if (!messageData || !messageData.message || !messageData.user) {
            console.error('There is no message data for creating message template');
            return;
        }

        // Create the message div element and add classes
        let messageEl = document.createElement('div');
        messageEl.classList.add('message-item');
        messageEl.classList.add((event === Classes.SENT) ? Classes.SENT : Classes.RECEIVED);

        // Add the innerHTML to the div
        let messageInnerHTML = `<div class="message">`;
        
        if (event === Classes.RECEIVED) {
            messageInnerHTML += `<span class="user">${messageData.user}: </span>`;
        }

        messageInnerHTML += `${messageData.message}</div>`;
        messageEl.innerHTML = messageInnerHTML;

        // Check if the user is waiting for reply and the element should scroll
        // or the user is reading older messages
        let shouldScroll = this.elements.messagesOuterWrapper.scrollTop + this.elements.messagesOuterWrapper.clientHeight 
                            === this.elements.messagesOuterWrapper.scrollHeight;

        // Append the message to the messages list
        this.elements.messagesWrapper.appendChild(messageEl);

        // Scroll to bottom if need
        if (shouldScroll) {
            this.elements.messagesOuterWrapper.scrollTo({top: this.elements.messagesOuterWrapper.scrollHeight});
        }

        // Add show class to the messages - to add nice appearing animations
        messageEl.classList.add('show');
    }
}

const Classes = Object.freeze({
    SENT              : 'sent',
    RECEIVED          : 'received',
    INPUT_FOCUS       : 'input-focus',
    CAN_SEND          : 'can-send',
    SHOW_TOP_SHADOW   : 'show-top-shadow',
    SHOW_BOTTOM_SHADOW: 'show-bottom-shadow'
});

document.addEventListener('DOMContentLoaded', () => {
    new Chat();
});