/**
 * Combo payout bars — thin gradient pills, titles centered above,
 * PAYS multiplier outside to the right. Icons omitted until live picks.
 */
export function CrazyCombos() {
  return (
    <div className="crazy-combos" role="group" aria-label="Crazy Combos">
      <article className="crazy-combos__item crazy-combos__item--combo">
        <h3 className="crazy-combos__caption">COMBO</h3>
        <div className="crazy-combos__track">
          <div className="crazy-combos__bar">
            <span className="crazy-combos__desc">1st 2nd &amp; 3rd:</span>
          </div>
          <div className="crazy-combos__pays">
            <span className="crazy-combos__pays-label">PAYS</span>
            <span className="crazy-combos__pays-value">x500</span>
          </div>
        </div>
      </article>

      <article className="crazy-combos__item crazy-combos__item--crazy">
        <h3 className="crazy-combos__caption">CRAZY COMBO</h3>
        <div className="crazy-combos__track">
          <div className="crazy-combos__bar crazy-combos__bar--slots">
            <span className="crazy-combos__slot">
              <span className="crazy-combos__slot-label">1st:</span>
            </span>
            <span className="crazy-combos__slot">
              <span className="crazy-combos__slot-label">2nd:</span>
            </span>
            <span className="crazy-combos__slot">
              <span className="crazy-combos__slot-label">3rd:</span>
            </span>
          </div>
          <div className="crazy-combos__pays">
            <span className="crazy-combos__pays-label">PAYS</span>
            <span className="crazy-combos__pays-value">x5000</span>
          </div>
        </div>
      </article>
    </div>
  )
}
