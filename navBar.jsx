// Ex 2 - remove any item from navbar with less than minStock in stock
// write out both the name and the number in stock in format apple:2
function NavBar({menuitems, minstock}) {
    const updatedList = menuitems.map((item, index) => {
        return <li key={index}>{item.name}</li>;
    });
    // note that React needs to have a single Parent
    return <ul style={{listStyleType: "none"}}>{updatedList}</ul>;
}
const menuItems = [
    {name: "apple", instock: 2},
    {name: "pineapple", instock: 3},
    {name: "pear", instock: 0},
    {name: "peach", instock: 3},
    {name: "orange", instock: 1}
];
const root = ReactDOM.createRoot(document.getElementById("root"));
const element = <NavBar menuitems={menuItems} minstock={2}/>
root.render(element);
