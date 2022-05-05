// simulate getting products from DataBase
const products = [
  // { name: 'Apples', country: 'Italy', cost: 4, instock: 1 },
  // { name: 'Oranges', country: 'Spain', cost: 3, instock: 1 },
  // { name: 'Beans', country: 'USA', cost: 2, instock: 1 },
  // { name: 'Cabbage', country: 'USA', cost: 1, instock: 1 },
];
//=========Cart=============
const Cart = (props) => {
  const { Card, Accordion, Button } = ReactBootstrap;
  let data = props.location.data ? props.location.data : products;
  console.log(`data: ${JSON.stringify(data)}`);

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
    console.log('useEffect Called');
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: 'FETCH_INIT' });
      try {
        const result = await axios(url);
        console.log('FETCH FROM URL');
        if (!didCancel) {
          dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: 'FETCH_FAILURE' });
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
    case 'FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case 'FETCH_FAILURE':
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
  const { Card, Accordion, Button, Container, Row, Col, Image, Input } = ReactBootstrap;
  //  Fetch Data
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState('http://localhost:1337/products');
  const [{ data, isLoading, isError }, doFetch] = useDataApi(query, {
    data: [],
  });
  console.log(`Rendering Products ${JSON.stringify(data)}`);
  // Fetch Data
  const addToCart = (e) => {
    let id = Number(e.target.id);
    let item = items.filter((item) => item.id === id);
    if (item[0].instock > 0) {
      item[0].instock--;
      const newItemSet = [...items.filter((item) => item.id !== id), ...item].sort((a, b) => a.id - b.id);
      setItems(newItemSet);
      setCart([...cart, ...item]);
    }
  };
  const deleteCartItem = (index) => {
    let newCart = cart.filter((item, i) => index != i);
    setCart(newCart);
  };
  // const photos = ['apple.png', 'orange.png', 'beans.png', 'cabbage.png'];

  console.log('items: ', items);
  let list =
    items &&
    items.map((item, index) => {
      let n = index + 1059;
      let url = 'https://picsum.photos/id/' + n + '/50/50';

      return (
        <li key={index}>
          <Image src={url} width={70} roundedCircle></Image>
          <Button variant="primary" size="large">
            {item.name}:{item.cost} - Stock:{item.instock}
          </Button>
          <input name={item.name} id={item.id} type="submit" onClick={addToCart}></input>
        </li>
      );
    });
  let cartList = cart.map((item, index) => {
    return (
      <Card key={index}>
        <Card.Header>
          <Accordion.Toggle as={Button} variant="link" eventKey={1 + index}>
            {item.name}
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse onClick={() => deleteCartItem(index)} eventKey={1 + index}>
          <Card.Body>
            $ {item.cost} from {item.country}
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    );
  });

  let finalList = () => {
    let total = checkOut();
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
    let costs = cart.map((item) => item.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    console.log(`total updated to ${newTotal}`);
    return newTotal;
  };
  // TODO: implement the restockProducts function
  const restockProducts = (url) => {
    doFetch(url);
    setItems(data);
  };

  return (
    <Container>
      <Row>
        <Col>
          <h1>Product List</h1>
          <ul style={{ listStyleType: 'none' }}>{list}</ul>
        </Col>
        <Col>
          <h1>Cart Contents</h1>
          <Accordion>{cartList}</Accordion>
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
          }}
        >
          <input type="text" value={query} onChange={(event) => setQuery(event.target.value)} />
          <button type="submit">ReStock Products</button>
        </form>
      </Row>
    </Container>
  );
};
// ========================================
ReactDOM.render(<Products />, document.getElementById('root'));
