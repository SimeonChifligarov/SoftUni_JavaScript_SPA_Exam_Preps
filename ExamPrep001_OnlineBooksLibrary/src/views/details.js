import { addLike, deleteBookById, getAllLikes, getBookById, ownLike } from '../api/data.js';
import { html } from '../lib.js';
import { getUserData } from '../util.js';


const detailsTemplate = (book, isOwner, onDelete, isLogged, hasLiked, onLike, likes) => html`
<section id="details-page" class="details">
    <div class="book-information">
        <h3>${book.title}</h3>
        <p class="type">Type: ${book.type}</p>
        <p class="img"><img src=${book.imageUrl}></p>
        <div class="actions">
            ${isOwner ? html`<a class="button" href="/edit/${book._id}">Edit</a>
            <a @click=${onDelete} class="button" href="javascript:void(0)">Delete</a>` : null}

            <!-- Bonus -->
            <!-- Like button ( Only for logged-in users, which is not creators of the current book ) -->
            ${(isLogged && !isOwner && !hasLiked) ? html`<a @click=${onLike} class="button" href="javascript:void(0)">Like</a>` : null}
            

            <!-- ( for Guests and Users )  -->
            <div class="likes">
                <img class="hearts" src="/images/heart.png">
                <span id="total-likes">Likes: ${likes}</span>
            </div>
            <!-- Bonus -->
        </div>
    </div>
    <div class="book-description">
        <h3>Description:</h3>
        <p>${book.description}</p>
    </div>
</section>`;


export async function detailsPage(ctx) {
    const userData = getUserData();
    const isLogged = userData ? 1 : 0;
    
    const [book, likes, hasLiked] = await Promise.all([
        getBookById(ctx.params.id),
        getAllLikes(ctx.params.id),
        userData ? ownLike(ctx.params.id, userData.id) : 0
    ]);

    // const book = await getBookById(ctx.params.id);

    // const likes = await getAllLikes(ctx.params.id);
    // const hasLiked = userData ? await ownLike(ctx.params.id, userData.id) : 0;

    const isOwner = userData && userData.id == book._ownerId;

    ctx.render(detailsTemplate(book, isOwner, onDelete, isLogged, hasLiked, onLike, likes));

    async function onDelete() {
        const choice = confirm(`Are you sure you want to delete ${book.title}?`)

        if (choice) {
            await deleteBookById(ctx.params.id);
            ctx.page.redirect('/');
        }
    }

    async function onLike() {
        await addLike(ctx.params.id);
        ctx.page.redirect('/details/' + ctx.params.id);
    }
}
