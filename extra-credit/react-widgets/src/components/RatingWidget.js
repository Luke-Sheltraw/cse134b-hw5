import { useState, useRef } from 'react';

const NUM_STARS = 5;
const STAR_ICON = '★';
const POS_MESSAGE_THRESHOLD = 0.8;

const RatingWidget = () => {
  const [submittedForm, setSubmittedForm] = useState(false);
  const starRatingRef = useRef(null);

  const handleClick = (starRating) => {
    setSubmittedForm(true);
    starRatingRef.current = starRating;

    const formBody = new FormData();
    formBody.append('rating', starRating);
    formBody.append('question', 'How satisfied are you?');
    formBody.append('sentBy', 'JS');

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

  const confirmationText = (starRatingRef.current / NUM_STARS) >= POS_MESSAGE_THRESHOLD
    ? `Thanks for the ${ starRatingRef.current } star rating!`
    : `Thanks for the feedback of ${ starRatingRef.current } stars. We'll try to do better!`;

  return (
    <section className='rating-widget'>
      {
        submittedForm
        ?
          <p>{ confirmationText }</p>
        : 
          Array.from({ length: NUM_STARS })
            .map((_, i) =>
              <button
                className='star-button'
                key={ i }
                onClick={ () => handleClick(i + 1) }
              >
                { STAR_ICON }
              </button>
            )
      }
    </section>
  );
};

export default RatingWidget;