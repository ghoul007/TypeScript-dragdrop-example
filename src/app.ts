//autobind decorator
const autobind = (_target: any, _name: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    }
    return adjDescriptor
}

class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: Element;

    titleInputElement: HTMLInputElement
    descriptionInputElement: HTMLInputElement
    peopleInputElement: HTMLInputElement

    constructor() {
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;;
        this.hostElement = document.getElementById('app') as HTMLDivElement;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLFormElement
        this.element.id = "user-input"


        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;


        this.attach();
        this.configure();
    }


    private submitHandler(event: Event) {
        event.preventDefault();
        console.log(this.titleInputElement.value);
    }

    @autobind
    private configure() {
        this.element.addEventListener('submit', this.submitHandler.bind(this))

    }


    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element)
    }
}


const project = new ProjectInput();