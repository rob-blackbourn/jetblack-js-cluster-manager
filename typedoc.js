module.exports = {
  entryPoints: ['src/index.ts'],
  out: 'docs',
  includes: 'manual',
  categorizeByGroup: true,
  readme: 'manual/README.md',
  pluginPages: {
    source: 'manual',
    pages: [
      {
        title: 'Guides',
        childrenDir: 'guide',
        children: [
          { title: 'Getting started', source: 'getting-started.md' },
          { title: 'Design Choices', source: 'design-choices.md' },
          { title: 'Date Arithmetic', source: 'date-arithmetic.md' },
          { title: 'Timezones', source: 'timezones.md' },
          { title: 'IANA Timezones', source: 'iana-timezones.md' },
          { title: 'Calendars', source: 'calendars.md' }
        ]
      }
    ]
  }
}
