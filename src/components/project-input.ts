import { projectState } from './../state/project-state';
import { Component } from "./base-component";
import { validate } from "../util/validation";
import { autobind } from "../decorators/autobind";

    export  class ProjectInput extends Component<HTMLDivElement, HTMLElement>  {

        titleInputElement: HTMLInputElement
        descriptionInputElement: HTMLInputElement
        peopleInputElement: HTMLInputElement

        constructor() {

            super('project-input', 'app', true, "user-input")

            this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
            this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
            this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

            this.configure();
        }


        private getUserInput(): [string, string, number] | undefined {
            const enteredTitle = this.titleInputElement.value
            const enteredDescription = this.descriptionInputElement.value
            const enteredPeople = this.peopleInputElement.value

            if (

                !validate({ value: enteredTitle, required: true, minLength: 5 }) ||
                !validate({ value: enteredDescription, required: true, minLength: 5 }) ||
                !validate({ value: +enteredPeople, required: true, min: 5 })

                // enteredTitle.trim().length === 0 ||
                // enteredDescription.trim().length === 0 ||
                // enteredPeople.trim().length === 0
            ) {
                alert('invalid input, please try agian')
                return;
            } else {
                return [enteredTitle,
                    enteredDescription,
                    +enteredPeople]
            }


        }


        private clearInputs() {
            this.titleInputElement.value = ''
            this.descriptionInputElement.value = ''
            this.peopleInputElement.value = ''
        }

        @autobind
        private submitHandler(event: Event) {
            event.preventDefault();
            const userInput = this.getUserInput();
            if (Array.isArray(userInput)) {
                const [title, desc, people] = userInput;
                console.log(title, desc, people);
                projectState.addProject(title, desc, people);
                this.clearInputs();
            }
        }

        configure() {

            this.element.addEventListener('submit', this.submitHandler)

        }

        renderContent() {

        }


    }
