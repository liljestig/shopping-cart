const products = [
    { name: "Apples", country: "Italy", cost: 3, instock: 10 },
    { name: "Oranges", country: "Spain", cost: 4, instock: 3 },
    { name: "Beans", country: "USA", cost: 2, instock: 5 },
    { name: "Cabbage", country: "USA", cost: 1, instock: 8 },
];

const Cart = (props) => {
    const { Card, Accordion, Button } = ReactBootstrap;
    let data = props.location.data ? props.location.data : products;
    console.log(`data:${JSON.stringify(data)}`);
    return <Accordion defaultActiveKey="0">{list}</Accordion>;
};

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
                console.log("FETCH FROM URl");
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

const Products = (props) => {
    const [items, setItems] = React.useState(products);
    const [cart, setCart] = React.useState([]);
    const [total, setTotal] = React.useState(0);
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
    //console.log(`Rendering Products ${JSON.stringify(data)}`);

    const addToCart = (e) => {
        let name = e.target.name;
        let item = items.filter((item) => item.name == name);
        if (item[0].instock > 0) {
            console.log(`add to Cart ${JSON.stringify(item)}`);
            item[0].instock = item[0].instock - 1;
            console.log("cart:");
            console.log(cart);
            console.log("item:");
            console.log(item);
            setCart([...cart, ...item]);
            doFetch(query);
        }
    };

    const deleteCartItem = (item, index) => {
        item.instock = item.instock + 1;
        let newCart = cart.filter((item, i) => index != i);
        setCart(newCart);
    };
    
    const photos = ["apple.png", "orange.png", "beans.png", "cabbage.png"];
    
    let list = items.map((item, index) => {
        let n = index + 1049;
        let url = "https://picsum.photos/id/" + n + "/50/50";
        
        return (
            <li key={index}>
                <Image src={url} width={70} roundedCircle></Image><br/>
                {item.name} from {item.country}<br/>
                Unit price: {item.cost}<br/>
                In stock: {item.instock}<br/>
                <button className="btn btn-primary" name={item.name} type="submit" onClick={addToCart}>Add to Cart</button>
            </li>
        );
    });
    
    let cartList = cart.map((item, index) => {
        return (
            <ul className="list-group" key={1+index} eventkey={1 + index}>
                <li className="list-group-item">
                    {item.name} <img src={"recycle.png"} onClick={() => deleteCartItem(item, index)} eventkey={1 + index}/>
                </li>
            </ul>
        );
    });

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
    
    const checkOut = () => {
        if (cart.length > 0) {
            alert(`Order received.`);
            setCart([]);
        }
        return;
    };
    
    // TODO: implement the restockProducts function
    const restockProducts = (url) => {
        doFetch(url);
        let newItems = data.data.map((item) => {
            let { name, country, cost, instock } = item.attributes;
            return { name, country, cost, instock };
        });
        setItems([...items, ...newItems]);
    };
    
    return (
        <Container>
            <Row>
                <Col >
                    <h1>Product List</h1>
                    <ul style={{ listStyleType: "none" }}>{list}</ul>
                </Col>
                <Col>
                    <h1>Cart Contents</h1>
                    <Accordion defaultActiveKey="0">{cartList}</Accordion>
                </Col>
                <Col>
                    <h1>CheckOut </h1>
                    <Button onClick={checkOut}>CheckOut $ {finalList().total}</Button>
                    <div> {finalList().total > 0 && finalList().final} </div>
                </Col>
            </Row>
            <Row>
                <form
                    onSubmit={(event) => {
                        restockProducts(query);
                        console.log(`Restock called on ${query}`);
                        event.preventDefault();
                    }}>
                    <input type="text" value={query} onChange={(event) => setQuery(event.target.value)} />
                    <button className="btn btn-primary" type="submit">ReStock Products</button>
                </form>
            </Row>
        </Container>
    );
};
// ========================================
ReactDOM.render(<Products />, document.getElementById("root"));
  