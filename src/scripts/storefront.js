import { concepts, products, types, sizes, getProduct, filterProducts, asset, money } from './catalog.js';
import { createCartStore } from './cart.js';
const $ = selector => document.querySelector(selector);
const cartStore = createCartStore(window.localStorage);
let cart = cartStore.items();
let filter='all', expanded=false, sort='featured', query='', selected=null, chosenSize='M', lastTrigger=null, toastTimer;
const pd=$('#productDialog'), cd=$('#cartDialog'), info=$('#infoDialog');
function sync(){cart=cartStore.items();document.querySelectorAll('[data-cart-count]').forEach(el=>el.textContent=cartStore.count());}
function persist(){cartStore.replace(cart);sync();}
function render(){let list=filterProducts({type:filter,query,sort});const total=list.length;if(sort==='low')list.sort((a,b)=>a.price-b.price);if(sort==='high')list.sort((a,b)=>b.price-a.price);$('#products').innerHTML=list.map(p=>`<article class="product"><div class="product-visual"><span class="tag">COLLECTION 01 / TYPE D</span><button class="image-button" data-product="${p.id}" aria-label="${p.name} view details" class="product-image-button"><img src="${asset(p)}" alt="${p.name} ${types[p.t]} boxer brief" loading="lazy"></button><button class="quick" data-product="${p.id}" aria-label="${p.name} choose options">+</button></div><div class="product-title"><h3><button data-product="${p.id}" class="product-name-button">${p.name}</button></h3><span class="price">${money(p.price)}</span></div><p class="product-sub">BOXER BRIEF · TYPE D / ${types[p.t]}</p><div class="swatches"><span class="swatch" style="--c:${concepts[p.c].color}"></span><span style="font-size:9px;color:#777">S – XL</span></div></article>`).join('');$('#resultsCount').textContent=`${total} designs`;$('#noResults').hidden=total!==0;}
function detail(id,reset=true){selected=getProduct(id);if(!selected)return;if(reset)chosenSize='M';const p=selected,c=concepts[p.c];$('#productDetail').innerHTML=`<div class="detail"><div class="detail-image"><img src="${asset(p)}" alt="${p.name} product concept"></div><div><div class="eyebrow">COLLECTION 01 / ${c.motif.toUpperCase()}</div><h2>${p.name}</h2><b>${money(p.price)}</b><p>${c.description}<br>An artistic interpretation of the ${c.name} collection concept, not a universal description of a diagnosis.</p><div class="label">GRAPHIC / TYPE D · ALL-OVER</div><div class="label">SIZE <button data-guide class="guide-link">Size guide ↗</button></div><div class="choices">${['S','M','L','XL'].map(s=>`<button data-size="${s}" aria-pressed="${s===chosenSize}" class="${s===chosenSize?'selected':''}">${s}</button>`).join('')}</div><button class="button green full" id="add">Add to bag <span>+</span></button><p>Design concept. Prices and sizes are illustrative.<br>Final pattern placement and production specifications may vary.</p></div></div>`;if(!pd.open){lastTrigger=document.activeElement;pd.showModal()}}
function toast(msg){$('#toast').textContent=msg;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3500)}
function cartView(){const subtotal=cartStore.subtotal();$('#cartContent').innerHTML=`<div class="eyebrow">YOUR FIRST LAYER</div><h2>Your bag <span style="color:var(--violet)">(${cartStore.count()})</span></h2>${cart.length?cart.map((r,i)=>{const p=getProduct(r.id);return `<div class="cart-row"><img src="${asset(p)}" alt="${p.name}"><div><h3>${p.name}</h3><p>TYPE D · ${r.size} / ${money(p.price)}</p><div class="quantity"><button data-qty="${i}" data-delta="-1" aria-label="Decrease quantity">−</button><span>${r.qty}</span><button data-qty="${i}" data-delta="1" aria-label="Increase quantity">+</button></div></div><div>${money(p.price*r.qty)}<br><button class="remove" data-remove="${i}">Remove</button></div></div>`}).join('')+`<div class="total"><span>Subtotal</span><b>${money(subtotal)}</b></div><p class="sample-note">Demo order only. No payment or shipping takes place.</p><button id="checkout" class="button green full">Checkout <span>↗</span></button>`:`<p style="padding:45px 0">Your bag is empty. Find a pattern that speaks to you.</p><button class="button full" id="continue">Continue shopping ↗</button>`}`;if(!cd.open){lastTrigger=document.activeElement;cd.showModal()}}
function guide(){ $('#infoContent').innerHTML='<div class="eyebrow">FIND YOUR FIT</div><h2>Size guide</h2><table><tr><th>Size</th><th>Waist (cm)</th></tr><tr><td>S</td><td>68–76</td></tr><tr><td>M</td><td>76–84</td></tr><tr><td>L</td><td>84–92</td></tr><tr><td>XL</td><td>92–100</td></tr></table><p class="notice">Illustrative sizing for this concept. Final garment measurements will be confirmed before retail release.</p>';info.showModal()}
function checkout(){ $('#cartContent').innerHTML=`<div class="eyebrow">ONE STEP CLOSER</div><h2>Checkout</h2><p class="notice">Demo checkout. Use sample details only. No payment, order transmission or shipping takes place. Delivery information is not saved.</p><form id="orderForm"><div class="checkout-grid"><label>Recipient<input name="name" required maxlength="40" placeholder="Sample customer" autocomplete="off"></label><label>Email<input name="email" type="email" required placeholder="test@example.com" autocomplete="off"></label><label>Phone<input name="phone" type="tel" required pattern="[0-9+() -]{7,20}" placeholder="555-0100" autocomplete="off"></label><label>Postal code<input name="zip" required pattern="[A-Za-z0-9 -]{3,12}" placeholder="00000" autocomplete="off"></label><label class="wide">Street address<input name="address" required maxlength="200" placeholder="Sample street address" autocomplete="off"></label><label class="wide">Address line 2<input name="detail" maxlength="100" placeholder="Apartment or suite (optional)" autocomplete="off"></label></div><div class="total"><span>Total · Free shipping (demo)</span><b>${money(cartStore.subtotal())}</b></div><label style="display:block;font-size:12px;margin-top:25px"><input type="checkbox" required> I understand this is a demo order, not a purchase.</label><button class="button green full" type="submit">Place demo order <span>↗</span></button><button type="button" id="backBag" class="load">Back to bag</button></form>`}

function shipping(){
 $('#infoContent').innerHTML='<h2 id="infoTitle">Shipping & returns</h2><p class="notice">SPANKY is currently a design project storefront. Products and orders are for demonstration only; no purchases or shipping take place.</p><p>Shipping times, costs, hygiene-related returns, seller details and customer support will be confirmed before retail release.</p>';info.showModal();
}
function resetFilters(){filter='all';sort='featured';query='';expanded=false;$('#search').value='';$('#sort').value=sort;updateFilters();render();}
function updateFilters(){document.querySelectorAll('[data-filter]').forEach(button=>{const active=button.dataset.filter===filter;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});}
function continueShopping(){cd.close();const shop=$('#shop');if(shop)shop.scrollIntoView({behavior:'smooth'});else location.href='index.html#shop';}
document.addEventListener('click',event=>{
 const button=event.target.closest('button');if(!button)return;
 if(button.classList.contains('close')){button.closest('dialog').close();return;}
 if(button.dataset.product!==undefined){detail(Number(button.dataset.product));return;}
 if(button.dataset.filter!==undefined){filter=button.dataset.filter;expanded=false;updateFilters();render();return;}
 if(button.dataset.type!==undefined){detail(selected.c*4+Number(button.dataset.type),false);return;}
 if(button.dataset.size){chosenSize=button.dataset.size;detail(selected.id,false);return;}
 if(button.hasAttribute('data-guide')||button.id==='sizeGuide'){guide();return;}
 if(button.id==='add'){cartStore.add(selected.id,chosenSize);sync();pd.close();toast('Added to your bag.');return;}
 if(button.matches('[data-open-cart]')){cartView();return;}
 if(button.id==='more'){expanded=true;render();return;}
 if(button.id==='resetFilters'){resetFilters();return;}
 if(button.dataset.qty!==undefined){const row=cart[Number(button.dataset.qty)];cartStore.change(row.id,row.size,Number(button.dataset.delta));sync();cartView();return;}
 if(button.dataset.remove!==undefined){const row=cart[Number(button.dataset.remove)];cartStore.remove(row.id,row.size);sync();cartView();return;}
 if(button.id==='checkout'){checkout();return;}
 if(button.id==='backBag'){cartView();return;}
 if(button.id==='continue'){continueShopping();return;}
 if(button.id==='shipping')shipping();
});
document.addEventListener('submit',event=>{
 if(event.target.id!=='orderForm')return;
 event.preventDefault();if(!cart.length){cartView();return;}
 if(!event.target.reportValidity())return;
 const id='SP-DEMO-'+crypto.randomUUID().slice(0,8).toUpperCase();const total=cartStore.subtotal();
 $('#cartContent').innerHTML=`<div class="success"><div class="check">✳</div><div class="eyebrow">YOUR MOOD IS IN THE BAG</div><h2 tabindex="-1">Demo order complete!</h2><p>${id}</p><p>Order total ${money(total)}</p><p class="notice">You have completed the demo checkout.<br>No payment was taken, order transmitted, email sent or shipment arranged.</p><button class="button green" id="continue">Keep exploring ↗</button></div>`;
 cartStore.clear();sync();$('.success h2').focus();
});
$('#sort')?.addEventListener('change',event=>{sort=event.target.value;render();});
$('#search')?.addEventListener('input',event=>{query=event.target.value;expanded=true;render();});
window.addEventListener('storage',event=>{if(event.key==='spanky-cart'){cartStore.reload();sync();if(cd.open)cartView();}});
document.querySelectorAll('dialog').forEach(dialog=>{
 dialog.addEventListener('close',()=>{lastTrigger?.focus();});
 dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
});
sync();if($('#products')){updateFilters();render();}
if(new URLSearchParams(location.search).get('bag')==='1')cartView();
