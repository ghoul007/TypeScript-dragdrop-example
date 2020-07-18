
// Project type
enum ProjectStatus {
    Active, Finished
}
class Project {
    constructor(public id: string,
        public title: string,
        public descriprtion: string,
        public people: number,
        public status: ProjectStatus,
    ) { }
}

//Project State Managment

type Listener = (items: Project[]) => void

class Projectstate {
    private listeners: Listener[] = [];
    private projects: Project[] = [];
    private static instance: Projectstate;

    private constructor() { }

    static getInstance() {
        if (this.instance) {
            return this.instance
        }
        this.instance = new Projectstate();
        return this.instance;
    }


    addListener(lisnerFn: Listener) {
        this.listeners.push(lisnerFn)
    }
    addProject(title: string, description: string, numPeople: number) {
        const newProject = new Project(
            Math.random().toString(),
            title,
            description,
            numPeople,
            ProjectStatus.Active
        )

        this.projects.push(newProject);

        for (const lisnerFn of this.listeners) {
            lisnerFn(this.projects.slice())
        }
    }
}


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

//validate

interface Validatable {
    value: string | number,
    required?: boolean,
    minLength?: number,
    maxLength?: number,
    max?: number,
    min?: number
}

const validate = (ele: Validatable): boolean => {
    let isValid = true;

    if (ele.required) {
        isValid = isValid && ele.value.toString().trim().length !== 0
    }

    if (ele.minLength != null && typeof ele.value === 'string') {
        isValid = isValid && ele.value.trim().length > ele.minLength
    }

    if (ele.maxLength != null && typeof ele.value === 'string') {
        isValid = isValid && ele.value.trim().length < ele.maxLength
    }

    if (ele.min != null && typeof ele.value === 'number') {
        isValid = isValid && ele.value > ele.min
    }

    if (ele.max != null && typeof ele.value === 'number') {
        isValid = isValid && ele.value < ele.max
    }


    return isValid;
}



class ProjectList {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: Element;
    assignedProjects: Project[];


    constructor(private type: 'active' | 'finished') {
        this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;;
        this.hostElement = document.getElementById('app') as HTMLDivElement;

        this.assignedProjects = [];
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLFormElement
        this.element.id = `${this.type}-projects`;


        projectState.addListener((projects: Project[]) => {
            this.assignedProjects = projects;
            this.renderProject();
        });
        this.attach();
        this.renderContent();


    }

    private renderProject() {
        const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
        for (const prj of this.assignedProjects) {
            const listItem = document.createElement('li');
            listItem.textContent = prj.title;
            listEl.appendChild(listItem);
        }
    }

    private renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';


    }

    private attach() {
        this.hostElement.insertAdjacentElement('beforeend', this.element)
    }
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

    private configure() {
        this.element.addEventListener('submit', this.submitHandler)

    }


    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element)
    }
}


const projectState = Projectstate.getInstance();

const project = new ProjectInput();
const projectListActive = new ProjectList('active');
const projectListFinish = new ProjectList('finished');


