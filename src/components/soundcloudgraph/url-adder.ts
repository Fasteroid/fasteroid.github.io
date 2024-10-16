import { replaceOutsideHTMLTags } from "$lib/utils";


const URL_REGEX = /(^|\s)(https?:\/\/)([^\s]+)/g; // (<ensure space before it>)(<protocol>)(<url to actually show>)

const HANDLE_REGEX = /(@)([a-zA-Z0-9_\-]+)/g;

const EMAIL_REGEX = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

const BR_TO_NEWLINE = /<br\/?>/g;
const NEWLINE_TO_BR = /\n/g


export function addHyperlinks(e: HTMLElement){

    let html = e.innerHTML;

    html = html.replace(BR_TO_NEWLINE, "\n"); // can't detect urls correctly if the newlines are <br> because "<br>" is not in \s

    html = html.replace(URL_REGEX, (_:string, p1: string, p2: string, p3: string) => {
        return `${p1}<a href="${p2}${p3}" target="_blank">${p3}</a>`;
    });

    html = html.replace(EMAIL_REGEX, (_:string, p1: string) => {
        return `<a href="mailto:${p1}" target="_blank">${p1}</a>`;
    });
    
    // TODO: for artists, if they exist in the map, take us there!
    html = replaceOutsideHTMLTags(html, HANDLE_REGEX, (p1: string, p2: string) => {
        return `${p1}<a href="https://soundcloud.com/${p2}" target="_blank">${p2}</a>`; // don't include the @, just like soundcloud.
    });

    html = html.replace(NEWLINE_TO_BR, "<br>");

    e.innerHTML = html;

}