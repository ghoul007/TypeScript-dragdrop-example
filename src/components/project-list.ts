import { autobind } from './../decorators/autobind.js';
import { Component } from './base-component.js';
import { DragTarget } from '../models/drag-drop.js';
import { Project, ProjectStatus } from '../models/project.js';
import { ProjectItem } from './project-item.js';
import { projectState } from '../state/project-state.js';



    export 

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
            projectState.moveProject(prjId, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished)
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
 