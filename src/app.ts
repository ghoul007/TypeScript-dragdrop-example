// Drag and Drop
interface Draggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
    dragOverHandler(event: DragEvent): void
    dropHandler(event: DragEvent): void
    dragLeaveHandler(event: DragEvent): void
}

// Project type
enum ProjectStatus {
    Active, Finished
}
class Project {
    constructor(public id: string,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus,
    ) { }
}

//Project State Managment

type Listener<T> = (items: T[]) => void


class State<T> {
    protected listeners: Listener<T>[] = [];

    addListener(lisnerFn: Listener<T>) {
        this.listeners.push(lisnerFn)
    }

}
class Projectstate extends State<Project> {
    private projects: Project[] = [];
    private static instance: Projectstate;

    private constructor() {
        super()
    }

    static getInstance() {
        if (this.instance) {
            return this.instance
        }
        this.instance = new Projectstate();
        return this.instance;
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
            this.updateListeners();
     
    }



    moveProject(projectId: string, newstatus: ProjectStatus) {
        const project = this.projects.find(prj => prj.id === projectId);
        console.log(project, newstatus);
        if (project && project.status!=newstatus) {
            project.status = newstatus;
            this.updateListeners();
        }
    }



    private updateListeners(){
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



//component base class

abstract class Component<T extends HTMLElement, U extends HTMLElement>{
    templateElement: HTMLTemplateElement;
    hostElement: T;
    element: U;
    constructor(templateId: string,
        hostElementId: string,
        insertAtStart: boolean,
        newElementId?: string) {
        this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;;
        this.hostElement = document.getElementById(hostElementId) as T;

        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as U
        if (newElementId) {
            this.element.id = `${newElementId}-projects`;
        }

        this.attach(insertAtStart);
    }


    private attach(insertAtStart: boolean) {
        this.hostElement.insertAdjacentElement(insertAtStart ? 'afterbegin' : 'beforeend', this.element)
    }

    abstract configure(): void;
    abstract renderContent(): void;

}


//projectItme Class

class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {


    private project: Project;

    get persons() {
        if (this.project.people === 1) {
            return '1 person'
        } else {

            return `${this.project.people} persons`
        }
    }

    constructor(hostId: string, project: Project) {
        super('single-project', hostId, false, project.id);
        this.project = project

        this.configure();
        this.renderContent();

    }


    @autobind
    dragStartHandler(event: DragEvent): void {
        event.dataTransfer!.setData('text/plain', this.project.id);
        event.dataTransfer!.effectAllowed = 'move';

    }

    @autobind
    dragEndHandler(_event: DragEvent): void {
        console.log("Method not implemented.", event);
    }

    configure() {
        this.element.addEventListener('dragstart', this.dragStartHandler)
        this.element.addEventListener('dragend', this.dragStartHandler)
    }

    renderContent() {
        this.element.querySelector('h2')!.textContent = this.project.title;
        this.element.querySelector('h3')!.textContent = this.persons + ' assigneed';
        this.element.querySelector('p')!.textContent = this.project.description;


    }
}


class ProjectList extends Component<HTMLTemplateElement, HTMLElement> implements DragTarget {
    assignedProjects: Project[];


    constructor(private type: 'active' | 'finished') {
        super('project-list', 'app', false, `${type}-projects`);

        this.assignedProjects = [];


        this.element.addEventListener('drop', this.dropHandler)
        this.element.addEventListener('dragover', this.dragOverHandler)
        this.element.addEventListener('dragleave', this.dragLeaveHandler)


        projectState.addListener((projects: Project[]) => {

            const relevantProjects = projects.filter(prj => {
                if (this.type === 'active') {
                    return prj.status === ProjectStatus.Active
                }
                return prj.status === ProjectStatus.Finished
            })
            this.assignedProjects = relevantProjects;
            this.renderProject();
        });
        this.configure();
        this.renderContent();


    }
    @autobind
    dragOverHandler(event: DragEvent): void {

        if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {

            event.preventDefault();
            const listEl = this.element.querySelector('ul')!;
            listEl.classList.add('droppable')
        }
    }

    dropHandler(event: DragEvent): void {

        const prjId = event.dataTransfer!.getData('text/plain');
        projectState.moveProject(prjId, this.type==='active'? ProjectStatus.Active: ProjectStatus.Finished)
    }


    @autobind
    dragLeaveHandler(_event: DragEvent): void {
        const listEl = this.element.querySelector('ul')!;
        listEl.classList.remove('droppable')
    }

    configure() { }

    private renderProject() {
        const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
        listEl.innerHTML = '';
        for (const prj of this.assignedProjects) {
            // const listItem = document.createElement('li');
            // listItem.textContent = prj.title;
            // listEl.appendChild(listItem);
            new ProjectItem(this.element.querySelector('ul')!.id, prj);
        }
    }

    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';


    }


}



class ProjectInput extends Component<HTMLDivElement, HTMLElement>  {

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


const projectState = Projectstate.getInstance();

const project = new ProjectInput();
const projectListActive = new ProjectList('active');
const projectListFinish = new ProjectList('finished');


