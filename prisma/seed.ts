import { prisma } from "../app/lib/repos/prisma"

async function main() {
  await prisma.game.create({
    data: {
      code: 'ssl',
      displayName: 'SSL 2001',
      settings: JSON.stringify({
        dataSource: {
          type: 'web_scrape',
          config: {
            clubsUrl: 'https://ssl2001.uk/teams.htm',
            leagues: {
              'Premiership': {
                tableUrl: 'https://ssl2001.uk/table_premier.txt',
                fixturesUrl: 'https://ssl2001.uk/fixtures_premier.txt',
              },
              'Division 1': {
                tableUrl: 'https://ssl2001.uk/table_first.txt',
                fixturesUrl: 'https://ssl2001.uk/fixtures_first.txt',
              },
              'Division 2': {
                tableUrl: 'https://ssl2001.uk/table_second.txt',
                fixturesUrl: 'https://ssl2001.uk/fixtures_second.txt',
              },
              'Youth Division 1': {
                tableUrl: 'https://ssl2001.uk/table_yd1.txt',
                fixturesUrl: 'https://ssl2001.uk/fixtures_yd1.txt',
              },
              'Youth Division 2': {
                tableUrl: 'https://ssl2001.uk/table_yd2.txt',
                fixturesUrl: 'https://ssl2001.uk/fixtures_yd2.txt',
              }
            }
          }
        },
      }),
      leagues: {
        create: [
          { name: 'Premiership', synonyms: 'Premiership, Prem, Premier League' },
          { name: 'Division 1',  synonyms: 'Division 1, Div 1, 1st Div, 1st Division, First Division, Division One' },
          { name: 'Division 2', synonyms: 'Division 2, Div 2, 2nd Div, 2nd Division, Second Division, Division Two' },
          { name: 'Youth Division 1', synonyms: 'Youth Division 1, Youth Div 1, Youth 1st Div, Youth 1st Division, Youth First Division, Youth Division One' },
          { name: 'Youth Division 2', synonyms: 'Youth Division 2, Youth Div 2, Youth 2nd Div, Youth 2nd Division, Youth Second Division, Youth Division Two' },
        ]
      }
    }
  })
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })