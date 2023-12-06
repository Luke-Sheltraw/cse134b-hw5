const STAR_ICON = '★';
const POS_MESSAGE_THRESHOLD = 0.8;

class RatingWidget extends HTMLElement {
  _buttonSymbolAttr;
  _numStars;
  _questionText;
  _starButtonEls;
  _contentWrapperEl;

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    /* Parse configuration attributes */
    this._buttonSymbolAttr = this.getAttribute('button-symbol') ?? STAR_ICON;

    /* Attach encapsulated styles */
    const ratingWidgetStyleSheet = new CSSStyleSheet();
    ratingWidgetStyleSheet.replaceSync(`
      div {
        width: fit-content;

        & button {
          color: var(--rating-widget-star-color-passive, #858585);
          font-size: 1.5rem;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
        }

        & button:not(:last-child) {
          padding-right: 0.175rem;
        }

        &:hover button {
          color: var(--rating-widget-star-color-active, #FFD700);
        }

        & button:hover ~ button {
          color: var(--rating-widget-star-color-passive, #858585);
        }
      }
    `);
    this.shadowRoot.adoptedStyleSheets = [ratingWidgetStyleSheet];

    /* Grab and store configuration information */
    const defaultRatingInputEl = document.querySelector('#rating');
    const hiddenQuestionEl = document.querySelector('input[name="question"]');
    if (!this._numStars) this._numStars = clamp(defaultRatingInputEl.max, 3, 10);
    if (!this._questionText) this._questionText = hiddenQuestionEl.value;

    /* Set up wrapper */
    this._contentWrapperEl = document.createElement('div');

    /* Build buttons */
    this._starButtonEls = Array.from({ length: this._numStars })
      .map((_,i) => {
        const starButtonEl = document.createElement('button');
        starButtonEl.dataset.starValue = i + 1;
        starButtonEl.ariaLabel = `${ i + 1 } Stars`;
        starButtonEl.innerText = this._buttonSymbolAttr;
        starButtonEl.addEventListener('click', this._submitFormOnStarClick);
        return starButtonEl;
      });

    this._contentWrapperEl.append(...this._starButtonEls);

    /* Attach content to root */
    this.shadowRoot.replaceChildren(this._contentWrapperEl);
  }

  disconnectedCallback() {
    /* Remove all event listeners */
    this._starButtonEls.forEach((starButtonEl) => {
      starButtonEl.removeEventListener('click', this._submitFormOnStarClick);
    });
  }

  _submitFormOnStarClick = (e) => {
    /* Parse rating to submit */
    const starRating = e.target.dataset.starValue;
    
    /* Create, populate, and attach confirmation message */
    const confirmationMsgEl = document.createElement('p');
    confirmationMsgEl.innerText = (starRating / this._numStars) >= POS_MESSAGE_THRESHOLD
      ? `Thanks for the ${ starRating } star rating!`
      : `Thanks for the feedback of ${ starRating } stars. We'll try to do better!`;
    this.shadowRoot.replaceChildren(confirmationMsgEl);

    /* Create form object */
    const formBody = new FormData();
    formBody.append('rating', starRating);
    formBody.append('question', this._questionText);
    formBody.append('sentBy', 'JS');

    /* Send form data to endpoint */
    fetch('https://httpbin.org/post', {
        method: 'POST',
        headers: {
          'X-Sent-By': 'JavaScript',
        },
        body: formBody,
      })
      .then((res) => res.json())
      .then(console.log); 
  }
}

window.customElements.define('rating-widget', RatingWidget);

/* Helpers */
function clamp(value, low, high) {
  return Math.max(low, Math.min(value, high));
}
