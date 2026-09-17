import React from "react";
import ProductGrid from '../components/products/ProductGrid';import {useWishlist} from '../context/WishlistContext';export default function Wishlist(){const {items}=useWishlist();return <div className="page"><div className="page-title"><span className="eyebrow">SAVED PRODUCTS</span><h1>Wishlist</h1></div><ProductGrid products={items} loading={false}/></div>}
