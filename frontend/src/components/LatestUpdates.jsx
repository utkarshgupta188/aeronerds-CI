import './AmendmentManager.css'

export default function LatestUpdates({ amendments, t, onAsk }) {
  return (
    <div className="amendments">
      <div className="assistant-header">
        <h1 className="section-title">{t('Latest Updates to the Rules', 'नियमों में नवीनतम अपडेट')}</h1>
        <p className="section-sub">
          {t('Changes recorded by BMC clerks after the 6 March 2025 consolidation. These apply on top of the base rules.', '6 मार्च 2025 के समेकन के बाद BMC क्लर्कों द्वारा दर्ज बदलाव। ये मूल नियमों के ऊपर लागू होते हैं।')}
        </p>
      </div>

      <div className="amend-cards">
        {amendments.map(a => (
          <article key={a.id} className="amend-card card">
            <div className="amend-card-top">
              <div className="amend-meta">
                <span className="rule-chip">Rule {a.rule_number}</span>
                {a.effective_date && (
                  <span className="amend-date">{t('Effective', 'प्रभावी')}: {a.effective_date}</span>
                )}
              </div>
            </div>
            <div className="amend-card-title">{a.title}</div>
            <div className="amend-card-text">{a.text}</div>
            <div className="amend-card-footer">
              <button className="link-ask" onClick={() => onAsk(`What is the latest amendment to Rule ${a.rule_number}?`)}>
                {t('Ask the assistant about this rule', 'इस नियम के बारे में सहायक से पूछें')} →
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
