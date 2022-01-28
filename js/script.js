'use strict';

(function () {

    const todoList = {
        formId: null,
        form: null,
        currentElemId: localStorage.currentElemId ? +localStorage.getItem('currentElemId') : 1 ,

        findForm() {
            const form = document.getElementById(this.formId);

            if (form === null || form.nodeName !== 'FORM') {
                throw new Error('There is no such form on the page');
            }

            this.form = form;
            return form;
        },


        addEvents() {
            this.form.addEventListener(
                'submit',
                (event) => this.formHandler(event)
            );

            document.addEventListener(
                'DOMContentLoaded',
                this.preFillHandler.bind(this)
            );    

            const todoItemsWrapper = document.getElementById('todoItems');

            todoItemsWrapper.addEventListener(
                'change',
                this.checkboxHandler.bind(this)
                );

            todoItemsWrapper.addEventListener(
                `click`,
                this.removeElement.bind(this)
            );    

            this.form.addEventListener(
                'click',
                this.removeAllTodos.bind(this)
            )
        },

        removeAllTodos({target}){
            if (!target.classList.contains(`remove-all`)) return;
            localStorage.removeItem(this.formId);
            document.getElementById('todoItems').innerHTML = "";
        },

        checkboxHandler({target}){
            const elemId = target.getAttribute(`data-elem-id`);
            const data = JSON.parse(localStorage.getItem(this.formId));
            const currentElem = data.find((todoItem) => todoItem.elemId === +elemId);
            currentElem.completedStatus = target.checked;
            localStorage.setItem(this.formId, JSON.stringify(data));
        },

        removeElement({target}){
            if (!target.classList.contains(`delete-btn`)) return;

            const elemId = target.getAttribute(`data-elem-id`);                         
            if (!elemId) throw new Error(`Element id is not defined`);
            
            this.removeItemFromLocalStorage(elemId);

            const todoWrapperToDel = this.findParentElByClass(target,'taskWrapper');    
            todoWrapperToDel.parentElement.remove();                                  
        },

        removeItemFromLocalStorage(elemId){                                                   
            const data = JSON.parse(localStorage.getItem(this.formId));                   
            const currentElemIndex = data.findIndex((todoItem) => todoItem.elemId === +elemId); 
            data.splice (currentElemIndex, 1);                                                  
            localStorage.setItem(this.formId, JSON.stringify(data));                            
        },

        findParentElByClass(element, parentElClassName){
            if(element === null) return null;
            if(element.classList.contains(parentElClassName)) return element;
            
            return this.findParentElByClass(
                element.parentElement, parentElClassName
              );
        },

        formHandler(event) {
            event.preventDefault();
            const inputs = this.findInputs(event.target);

            let data = {
                id: this.formId,
                completedStatus: false,
                elemId: this.currentElemId ,
              };

            inputs.forEach(input => {                 
                data[input.name] = input.value;
            });         

            localStorage.setItem('currentElemId', ++this.currentElemId);

            this.setData(data);
            const template = this.createTemplate(data);

            document                
                .getElementById('todoItems')
                .prepend(template);

            event.target.reset()                
        },

        findInputs(target) {
            return target.querySelectorAll('input:not([type=submit]), textarea');  
        },

        preFillHandler() {
            const data = this.getData();

            data.forEach(todoItem => {                       
                const template = this.createTemplate(todoItem);
                document
                    .getElementById('todoItems')
                    .prepend(template);
            })

        },

        setData(data) {
            if (!localStorage.getItem(this.formId)) {
                let arr = [];
                arr.push(data);

                localStorage.setItem(
                    this.formId,
                    JSON.stringify(arr)
                );

                return;
            }


            let existingData = localStorage.getItem(this.formId);
            existingData = JSON.parse(existingData);
            existingData.push(data);
            localStorage.setItem(
                this.formId,
                JSON.stringify(existingData)
            );
        },

        getData() {
            return JSON.parse(
                localStorage.getItem(this.formId)
            );

        },

        createTemplate({ title, description, elemId, completedStatus }) {

            const todoItem = this.createElement('div', 'col-4');
            const taskWrapper = this.createElement('div', 'taskWrapper');
            todoItem.append(taskWrapper);                            

            const taskHeading = this.createElement(
                'div',
                'taskHeading',
                title
            );
            const taskDescription = this.createElement(
                'div',
                'taskDescription',
                description
            );

            let checkboxWrapper = this.createElement(`label`, `completed`);

            let checkbox = this.createElement ('input', 'form-check-input');
            checkbox.type = 'checkbox';
            checkbox.setAttribute('data-elem-id', `${elemId}`);

            if(completedStatus){
                checkbox.setAttribute('checked', 'checked');
            }

            let checkboxStatus = this.createElement(`span`, `status-action`, "Done!");

            let taskDeleteBtn = this.createElement ('button', ['btn', 'btn-danger', 'delete-btn'], 'Delete');
            taskDeleteBtn.setAttribute('data-elem-id', `${elemId}`);

      
            taskWrapper.append(taskHeading);
            taskWrapper.append(taskDescription);
            taskWrapper.append(checkboxWrapper);
            checkboxWrapper.append(checkbox);
            checkboxWrapper.append(checkboxStatus);
            taskWrapper.append(taskDeleteBtn);

            return todoItem;
        },

        createElement(nodeName, classes, innerContent) {    
            const el = document.createElement(nodeName);

            if (Array.isArray(classes)) {                 

                classes.forEach(singleClassName => {      
                    el.classList.add(singleClassName);
                })

            } else {
                el.classList.add(classes);
            }

            if (innerContent) {
                el.innerHTML = innerContent; 
            }

            return el;
        },

        init(todoListFormID) {
            if (typeof todoListFormID !== 'string' || todoListFormID.length === 0) {
                throw new Error('Todo list ID is not valid');
            }

            this.formId = todoListFormID;
            this.findForm();
            this.addEvents();

        }

    }

    todoList.init('todoForm');

})()