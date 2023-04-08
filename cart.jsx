
// Simulate getting products from database
const products = [
    { name: "Apples", country: "Italy", cost: 3, instock: 10 },
    { name: "Oranges", country: "Spain", cost: 4, instock: 3 },
    { name: "Beans", country: "USA", cost: 2, instock: 5 },
    { name: "Cabbage", country: "USA", cost: 1, instock: 8 },
];

// Cart contents
const Cart = (props) => {
    const { Card, Accordion, Button } = ReactBootstrap;
    let data = props.location.data ? props.location.data : products;
    console.log(`data:${JSON.stringify(data)}`);
    return <Accordion defaultActiveKey="0">{list}</Accordion>;
};

// Data API
const useDataApi = (initialUrl, initialData) => {
    const { useState, useEffect, useReducer } = React;
    const [url, setUrl] = useState(initialUrl);

    const [state, dispatch] = useReducer(dataFetchReducer, {
        isLoading: false,
        isError: false,
        data: initialData,
    });
    console.log(`useDataApi called`);
    useEffect(() => {
        console.log("useEffect Called");
        let didCancel = false;
        const fetchData = async () => {
            dispatch({ type: "FETCH_INIT" });
            try {
                const result = await axios(url);
                console.log("FETCH FROM URL");
                if (!didCancel) {
                    dispatch({ type: "FETCH_SUCCESS", payload: result.data });
                }
            } catch (error) {
                if (!didCancel) {
                    dispatch({ type: "FETCH_FAILURE" });
                }
            }
        };
        fetchData();
        return () => {
            didCancel = true;
        };
    }, [url]);
    return [state, setUrl];
};

const dataFetchReducer = (state, action) => {
    switch (action.type) {
        case "FETCH_INIT":
            return {
                ...state,
                isLoading: true,
                isError: false,
            };
        case "FETCH_SUCCESS":
            return {
                ...state,
                isLoading: false,
                isError: false,
                data: action.payload,
            };
        case "FETCH_FAILURE":
            return {
                ...state,
                isLoading: false,
                isError: true,
            };
        default:
        throw new Error();
    }
};

// Render products
const Products = (props) => {
    const [items, setItems] = React.useState(products);
    const [cart, setCart] = React.useState([]);
    const [total, setTotal] = React.useState(0);
    const [, updateState] = React.useState();
    const forceUpdate = React.useCallback(() => updateState({}), []);  
    const {
        Card,
        Accordion,
        Button,
        Container,
        Row,
        Col,
        Image,
        Input,
    } = ReactBootstrap;
    const { Fragment, useState, useEffect, useReducer } = React;
    const [query, setQuery] = useState("http://localhost:1337/api/products");
    const [{ data, isLoading, isError }, doFetch] = useDataApi(
        "http://localhost:1337/api/products",
        {
            data: [],
        }
    );
    console.log(`Rendering Products ${JSON.stringify(data.data)}`);    

    // Add item to cart from stocks
    const addToCart = (e) => {
        let name = e.target.name;
        let item = items.filter((item) => item.name == name);
        if (item[0].instock == 0) return;
        item[0].instock = item[0].instock - 1;
        console.log(`add to Cart ${JSON.stringify(item)}`);
        setCart([...cart, ...item]);
        doFetch(query);
    };

    // Delete and re-stock cart item
    const deleteCartItem = (delIndex) => {
        let newCart = cart.filter((item, i) => delIndex != i);
        let itemDeleted = cart.filter((item, index) => delIndex == index);
        let newItems = items.map((item, index) => {
            if (item.name == itemDeleted[0].name) item.instock = item.instock + 1;
            return item;
        });
        setCart(newCart);
        setItems(newItems);
    };

    // Generate product list with images
    const photos = ["apple.png", "orange.png", "beans.png", "cabbage.png"];
    let list = items.map((item, index) => {
        return (
            <li key={index}>
                <Image src={photos[index % 4]} width={70} roundedCircle></Image>
                {item.name} from {item.country}<br/>
                Unit price: ${item.cost}<br/>
                In stock: {item.instock}<br/>
                <button className="btn btn-primary" name={item.name} type="submit" onClick={addToCart}>Add to Cart</button>                
            </li>
        );
    });

    // Generate list of cart contents
    let cartList = cart.map((item, index) => {
        return (
            <ul className="list-group" key={1+index} eventkey={1 + index}>
                <li className="list-group-item">
                    {item.name} <img src={"recycle.png"} onClick={() => deleteCartItem(index)} eventkey={1 + index}/>
                </li>
            </ul>
        );
    });

    // Generate final cart list
    let finalList = () => {
        let costs = cart.map((item) => item.cost);
        const reducer = (accum, current) => accum + current;
        let total = costs.reduce(reducer, 0);
        let final = cart.map((item, index) => {
            return (
                <div key={index} index={index}>
                    {item.name}
                </div>
            );
        });
        return { final, total };
    };

    // Check out cart
    const checkOut = () => {
        if (cart.length > 0) {
            alert(`Order received. Welcome back soon.`);
            setCart([]);
        }
        return;
    };

    // Re-stock products
    const restockProducts = (url) => {
        doFetch(url);
        let itemdata = data.data;
        let tempItems = items;
        // Traverse itemdata
        for (const newitem of itemdata) {
            for (const item of tempItems) {
                // Add matching items to stock
                if (newitem.attributes.name === item.name) {
                    item.instock = item.instock + newitem.attributes.instock;
                }
            }
        }
        // Update products
        setItems (tempItems);
        forceUpdate ();
    };
    return (
        <Container>
            <Row>
                <Col>
                    <h1>Product List</h1>
                    <ul style={{ listStyleType: "none" }}>{list}</ul>
                </Col>
                <Col>
                    <h1>Cart Contents</h1>
                    <Accordion defaultActiveKey="0">{cartList}</Accordion>
                </Col>
                <Col>
                    <h1>Check Out</h1>
                    <Button onClick={checkOut}>Check Out</Button>
                    <div> {finalList().total > 0 && finalList().final} </div>
                    Total amount: ${finalList().total}
                </Col>
            </Row>
            <Row>
                <form onSubmit={(event) => {
                    console.log(`Re-stocking products from ${query}`);
                    restockProducts(`${query}`);
                    event.preventDefault();
                }}>
                    <input type="text" value={query} onChange={(event) => setQuery(event.target.value)}/>
                    <button className="btn btn-primary" type="submit">Re-stock Products</button>
                </form>
            </Row>
        </Container>
    );
};

// Render webpage
ReactDOM.render(<Products />, document.getElementById("root"));