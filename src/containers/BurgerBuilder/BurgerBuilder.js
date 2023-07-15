import React, { useState, useEffect, useCallback} from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Auxillary from '../../hoc/Auxillary/Auxillary';
import Burger from '../../components/Burger/Burger.js';
import  BuildControls from '../../components/Burger/BuildControls/BuildControls.js';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';
import axios from '../../axios-orders';
import * as actions from '../../store/actions/index';

export const burgerBuilder= props => {

//  constructor(props){
//      super(props);
//      this.state ={..}
//  } 

    const [purchasing, setPurchasing] = useState(false);

    const dispatch = useDispatch();

    const ings = useSelector(state => {
        return state.burgerBuilder.ingredients;
    });
    const price = useSelector(state => state.burgerBuilder.totalPrice);
    const error = useSelector(state => state.burgerBuilder.error);
    const isAutheticated = useSelector(state => state.auth.token !== null);

    const onIngredientAdded = ingName => dispatch(actions.addIngredient(ingName));
    const onIngredientRemoved = ingName => dispatch(actions.removeIngredient(ingName));
    const onInitIngredients = useCallback(() => 
        dispatch(actions.initIngredients()), 
        [dispatch]);
    const onInitPurchase = () => dispatch(actions.purchaseInit());
    const onSetAuthRedirectPath = path => dispatch(actions.setAuthRedirectPath(path));

    useEffect(() => {
        onInitIngredients();
    }, [onInitIngredients]);

    const updatePurchaseState = ingredients => {
        const sum =Object.keys(ingredients)
        .map(igKey =>{
            return ingredients[igKey];
        }) 
        .reduce((sum,el)=> {
            return sum + el;
        }, 0);
        return sum > 0;
    }

    const purchaseHandler = () => {
        if(isAutheticated){
            setPurchasing(true);
        }else {
            onSetAuthRedirectPath('/checkout');
            props.history.push('/auth');
        }
    }

    const purchaseCancelHandler =() => {
        setPurchasing(false);
    }

    const purchaseContinueHandler =() => {
        onInitPurchase();
        props.history.push('/checkout');
    }

        const disabledInfo = {
               ...ings
        };
        for(let key in disabledInfo){
            disabledInfo[key]=  disabledInfo[key] <= 0
        }
        let orderSummary = null;
        let burger = error ? <p>Ingrediens can't be loaded!</p> : <Spinner />;

        if(ings){
            burger = (
                <Auxillary>
                      <Burger ingredients={ings}/>
                      <BuildControls 
                           ingredientAdded ={onIngredientAdded}
                           ingredientRemoved={onIngredientRemoved}
                           disabled={disabledInfo}
                           purchasable={updatePurchaseState(ings)}
                           ordered={purchaseHandler}
                           isAuth={isAutheticated}
                           price={price}/>
                </Auxillary>
             );
            orderSummary = <OrderSummary  
               ingredients={ings} 
               price={price}
               purchaseCancelled ={purchaseCancelHandler}
               purchaseContinued={purchaseContinueHandler}/>;
            }
        return(
            <Auxillary>
                <Modal show={purchasing} modalClosed={purchaseCancelHandler}>
                    {orderSummary}
                </Modal>   
                {burger}   
            </Auxillary>
        );
}

export default (withErrorHandler(burgerBuilder, axios)) ;