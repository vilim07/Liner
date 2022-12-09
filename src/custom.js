import gsap from "gsap";


const getOffset = (el) => {
    const rect = el.getBoundingClientRect();
    const parent = el.parentNode.parentNode.getBoundingClientRect();
    return {
        center: rect.left - parent.left + rect.width / 2,
        top: rect.top - parent.top + rect.height / 2,
        left: rect.left - parent.left,
        width: rect.width || el.offsetWidth,
        height: rect.height || el.offsetHeight
    };
}

const connect = (div1, div2) => {
    const off1 = getOffset(div1);
    const off2 = getOffset(div2);
    const section = document.querySelector("section");
    const parentRect = section.getBoundingClientRect();
    const x1 = off1.center;
    const y1 = off1.top;
    const x2 = off2.center;
    const y2 = off2.top;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttributeNS(null, "viewBox", "0 0 " + parentRect.width + " " + parentRect.height + "");
    svg.setAttributeNS(null, "preserveAspectRatio", "none");
    let orientation;
    if (off1.left < off2.left) {
        orientation = "rtl";
    }
    else {
        orientation = "ltr";
    }

    svg.innerHTML = "<line class=" + orientation + " x1=" + x1 + " y1=" + y1 + " x2=" + x2 + " y2=" + y2 + " vector-effect='non-scaling-stroke' stroke-linecap='round'/>";
    section.appendChild(svg);


    return svg;
}

const disconnect = (item) => {
    const colIndex = item.parentNode.dataset.column;
    const itemIndex = item.dataset.item;

    const connectors = document.querySelectorAll("svg[data-connections*='" + colIndex + "-" + itemIndex + "']");
    Array.from(connectors).forEach(connector => {
        const line = connector.querySelector("line");
        if (!connector.removed) {
            connector.removed = true
            gsap.fromTo(line, {
                strokeDashoffset: 20000,
            },
                {
                    strokeDashoffset: 10000,
                    duration: 1,
                    ease: "power2.in",
                    onComplete: () => { connector.remove() }
                })
        }


    })
}

const setItemActive = (item) => {
    item.classList.toggle("active");
    if (item.bounce == false) {
        if (item.active == true) {
            item.active = false;
        }
        else {
            item.active = true;
            restoreWare(item);

        }
    }
    else {
        if (item.active == true) {
            item.active = false;
            const img = item.querySelector("span");

            gsap.fromTo(img, {
                scale: 1,
                background: "#63DF68",
                border: "5px solid #1CAF1F",

            },
                {
                    scale: 1,
                    border: "5px solid transparent",
                    background: "transparent",
                    duration: 0.4,
                    ease: "back.inOut(1.7)"
                })
        }
        else {
            const img = item.querySelector("span");

            item.active = true;
            restoreWare(item);
            gsap.fromTo(img, {
                scale: 0,
                background: "transparent"
            },
                {
                    scale: 1,
                    background: "#63DF68",
                    border: "5px solid #1CAF1F",
                    duration: 0.4,
                    force3D: true,
                    ease: "back.inOut(1.7)"
                })
        }
    }

}

const wareOut = (item) => {
    item.classList.add("worn");
    gsap.to(item, {
        alpha: 0.5,
    })
}

const restoreWareColumns = (columns, index) => {
    const column = columns[index];
    const actives = Array.from(column.querySelectorAll(".active"));


    if (columns[index-1]){
        const prevColumn = columns[index-1];

        if (prevColumn.querySelectorAll(".worn")) {
            restoreColWorn(columns, index-1);
        }
    }
    
    if (columns[index+1]){
        const nextColumn = columns[index+1];
        if (nextColumn.querySelectorAll(".worn")) {
            restoreColWorn(columns, index+1);
        }
    }
}

const restoreColWorn = (columns, index) => {
    const prevColumn = columns[index-1];
    const nextColumn = columns[index+1];
    const column = columns[index];
    
    const wornItems = Array.from(column.querySelectorAll(".worn"));

    wornItems.forEach(item => {
        let survive = true;
        if (prevColumn) {
            const prevActive = Array.from(prevColumn.querySelectorAll(".active"));
            let forbiden = " ";


            prevActive.forEach(element => {
                if (element.getAttribute("data-forbiden") != "null") {
                    forbiden += element.dataset.forbiden;
                }
            });

            if (forbiden.includes(item.dataset.item)) {
                survive = false;
            }
        }
        if (nextColumn) {
            const nextActive = Array.from(nextColumn.querySelectorAll(".active"));
            nextActive.forEach(element => {
                if (item.dataset.forbiden.includes(element.dataset.item)) {
                    survive = false;
                }
            });
        }
        if (survive) {
            restoreWare(item)
        }
    })
}

const restoreWare = (item) => {


    gsap.to(item, {
        alpha: 1,
    })
    item.classList.remove("worn");


}

const connectItems = (item, columns, currCol) => {
    let itemForbiden = " ";
    if (item.getAttribute("data-forbiden") != "null") {
        itemForbiden += item.dataset.forbiden;
    }

    Array.from(columns).forEach((column, i) => {
        if (column) {
            const adjActive = column.querySelectorAll('.active');
            const colItems = column.querySelectorAll('.item')
            const adjCol = column.dataset.column;
            ///PREV
            if (i == 0) {
                Array.from(colItems).forEach(colItem => {
                    let forbidenNext = " ";
                    if (colItem.getAttribute("data-forbiden") != "null") {
                        forbidenNext += colItem.dataset.forbiden;
                    }
                    if (forbidenNext.includes(item.dataset.item)) {
                        wareOut(colItem)
                    }
                })

                Array.from(adjActive).forEach(active => {
                    let forbiden = " ";

                    if (active.getAttribute("data-forbiden") != "null") {
                        forbiden += active.dataset.forbiden;
                    }
                    if (forbiden.includes(item.dataset.item)) {
                        const img = active.querySelector("span");

                        setItemActive(active)
                        disconnect(active)
                        gsap.fromTo(img, {
                            scale: 1,
                            background: "#63DF68",
                            border: "5px solid #1CAF1F"
                        },
                            {
                                scale: 1,
                                border: "5px solid transparent",
                                background: "transparent",
                                duration: 0.4,
                                ease: "back.inOut(1.7)"
                            })
                    }
                    else {
                        const svg = connect(item, active);
                        svg.dataset.connections = (currCol + 1) + "-" + (item.dataset.item) + "+" + adjCol + "-" + active.dataset.item;
                        const line = svg.querySelector('line');
                        gsap.from(line, {
                            strokeDashoffset: 10000,
                            duration: 1,
                            ease: "power2.in"
                        })
                    }

                })


            }
            ///NEXT
            else {
                Array.from(colItems).forEach(colItem => {
                    let forbidenNext = " ";
                    if (item.getAttribute("data-forbiden") != "null") {
                        forbidenNext += item.dataset.forbiden;
                    }
                    if (forbidenNext.includes(colItem.dataset.item)) {
                        wareOut(colItem)
                    }
                })
                Array.from(adjActive).forEach(active => {
                    ////NEXT COLUMN
                    if (!itemForbiden.includes(active.dataset.item)) {
                        const svg = connect(item, active);
                        svg.dataset.connections = (currCol + 1) + "-" + (item.dataset.item) + "+" + adjCol + "-" + active.dataset.item;
                        const line = svg.querySelector('line');
                        gsap.from(line, {
                            strokeDashoffset: 10000,
                            duration: 1,
                            ease: "power2.in"
                        })
                    }
                    else {
                        disconnect(active)
                        setItemActive(active)

                    }


                })
            }

        }
    })
    setItemActive(item);
}

const switchParent = (rec, donor) => {
    const column = donor.parentNode.dataset.column;
    const item = donor.dataset.item;
    const itemRec = rec.dataset.item;
    const connectors = document.querySelectorAll("svg[data-connections*='" + column + "-" + item + "']");
    Array.from(connectors).forEach(connector => {
        const data = connector.dataset.connections;
        connector.setAttribute('data-connections', data.replace(column + "-" + item, column + "-" + itemRec))

    })
    return connectors;
}
const enforceForbiden = (item, columns, currCol) => {
    let itemForbiden = " ";
    if (item.getAttribute("data-forbiden") != "null") {
        itemForbiden += item.dataset.forbiden;
    }

    Array.from(columns).forEach((column, i) => {
        if (column) {
            const adjActive = column.querySelectorAll('.active');
            const colItems = column.querySelectorAll('.item')
            const adjCol = column.dataset.column;
            ///PREV
            if (i == 0) {
                Array.from(colItems).forEach(colItem => {
                    let forbidenNext = " ";
                    if (colItem.getAttribute("data-forbiden") != "null") {
                        forbidenNext += colItem.dataset.forbiden;
                    }
                    if (forbidenNext.includes(item.dataset.item)) {
                        wareOut(colItem)
                    }
                })

                Array.from(adjActive).forEach(active => {
                    let forbiden = " ";

                    if (active.getAttribute("data-forbiden") != "null") {
                        forbiden += active.dataset.forbiden;
                    }
                    if (forbiden.includes(item.dataset.item)) {
                        const img = active.querySelector("span");

                        setItemActive(active)
                        disconnect(active)
                        gsap.fromTo(img, {
                            scale: 1,
                            background: "#63DF68",
                            border: "5px solid #1CAF1F"
                        },
                            {
                                scale: 1,
                                border: "5px solid transparent",
                                background: "transparent",
                                duration: 0.2,
                                ease: "back.inOut(1.7)"
                            })
                    }
                })


            }
            ///NEXT
            else {
                Array.from(colItems).forEach(colItem => {
                    let forbidenNext = " ";
                    if (item.getAttribute("data-forbiden") != "null") {
                        forbidenNext += item.dataset.forbiden;
                    }
                    if (forbidenNext.includes(colItem.dataset.item)) {
                        wareOut(colItem)
                    }
                })
                Array.from(adjActive).forEach(active => {
                    ////NEXT COLUMN
                    if (!itemForbiden.includes(active.dataset.item)) {

                    }
                    else {
                        disconnect(active)
                        setItemActive(active)

                    }


                })
            }

        }
    })
}
/* const animateLines (lines) =>{
    lines.forEach(connector =>{
        const off = getOffset(bg);
        const x1 = off.center;
        const y1 = off.top;
        connector.setAttribute('x1', x1);
        connector.setAttribute('y1', y1);
        console.log(connector);

    })
} */

const transferBG = (rec, donor) => {
    const bg = rec.parentNode.querySelector(".pseudoBG");
    const recOffset = rec.getBoundingClientRect().top;
    const svgs = Array.from(switchParent(rec, donor));
    let connectors = [];
    svgs.forEach(svg => {
        connectors.push(svg.querySelector("line"));
    })


    gsap.to(bg, {
        y: recOffset,
        duration: 0.4,
        onUpdate: () => {
            connectors.forEach(connector => {
                let off = getOffset(bg);
                if (connector.classList.contains("rtl")) {
                    if (off.left > connector.getAttribute("x1")) {
                        connector.setAttribute('y2', off.top);
                    }
                    else {
                        connector.setAttribute('y1', off.top);
                    }
                }
                else {
                    if (off.left > connector.getAttribute("x2")) {
                        connector.setAttribute('y1', off.top);
                    }
                    else {
                        connector.setAttribute('y2', off.top);
                    }
                }


            })
        }
    })

}
const columns = document.querySelectorAll("section.liner .column");


Array.from(columns).forEach((column, cindex) => {
    column.dataset.column = cindex + 1;
    const items = column.querySelectorAll(".item");
    let multiple = true;
    if (column.hasAttribute('data-multiple')) {
        multiple = (column.dataset.multiple === 'true');
    }
    if (!multiple) {
        Array.from(column.querySelectorAll(".item")).forEach(element => {
            element.bounce = false;
        })
    }
    Array.from(items).forEach((item, index) => {
        item.dataset.item = index + 1;

        if (item.classList.contains("active")) {
            item.active = true;
            const img = item.querySelector("span");
            gsap.fromTo(img, {
                background: "transparent"
            },
                {
                    background: "#63DF68",
                    border: "5px solid #1CAF1F",
                    duration: 0.4,
                    force3D: true,
                    ease: "back.inOut(1.7)"
                })
        }
        else {
            item.active = false;

        }
        //////
        const span = item.querySelector("span");
        span.addEventListener("click", (e) => {
            if (!multiple) {
                const active = column.querySelector(".item.active");

                if (!active) {
                    connectItems(
                        item,
                        [columns[cindex - 1],
                        columns[cindex + 1]],
                        cindex,
                    );
                    const pseudoBG = document.createElement("span");
                    pseudoBG.classList.add("pseudoBG");
                    pseudoBG.dataset.item = null;
                    column.appendChild(pseudoBG);
                    column.pbg = pseudoBG;
                    const itemOffset = item.getBoundingClientRect().top;
                    gsap.set(pseudoBG, {
                        y: itemOffset,
                        alpha: 0,
                    })
                    gsap.to(pseudoBG, {
                        alpha: 1,
                        duration: 0.3
                    })
                }
                else {
                    if (active != item) {
                        setItemActive(active);
                        setItemActive(item);

                    }
                    enforceForbiden(
                        item,
                        [columns[cindex - 1],
                        columns[cindex + 1]],
                        cindex,
                    )
                    restoreWareColumns(
                        columns,
                        cindex
                    )
                    transferBG(item, active);
                }


            }

            else {
                if (item.active == true) {
                    if (column.dataset.min == 1 && column.querySelectorAll(".active").length == 1) {
                    }
                    else {
                        disconnect(item);
                        setItemActive(item);
                        restoreWareColumns(
                            columns,
                            cindex
                        )
                    }

                }
                else {
                    restoreWareColumns(
                        columns,
                        cindex
                    )
                    connectItems(
                        item,
                        [columns[cindex - 1],
                        columns[cindex + 1]],
                        cindex,
                    );
                    restoreColWorn(
                        columns,
                        cindex
                    )
                }
            }



        })
    })



})

