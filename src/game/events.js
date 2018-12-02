import {
  propEq,
  pipe,
  identity,
  when,
  always,
  T,
  prepend,
  evolve,
  compose,
  not,
  either,
  both,
  unless,
  isNil,
  partialRight,
  __,
  ifElse,
} from 'ramda'
import initialState from './state'
import step, { nextEvent, kill, formatTime } from './sim'

const isNotNil = compose(
  not,
  isNil,
)

const event = (
  description,
  condition = T,
  options = [option('Continue')],
  isOutcome = false,
) => ({
  description,
  condition,
  options,
  isOutcome,
})

const outcomeEvent = description =>
  event(description, undefined, undefined, true)

const prependOutcomeEvent = description =>
  evolve({
    possibleEvents: prepend(outcomeEvent(description)),
  })

const option = (
  text,
  outcome = undefined,
  effect = identity,
  stepAfter = true,
) => ({
  text,
  effect: pipe(
    effect,
    outcome ? prependOutcomeEvent(outcome) : identity,
    ifElse(always(stepAfter && !outcome), step, nextEvent),
  ),
})

const terminalEvents = [
  event('You have arrived at Mars.', propEq('time', 5), [
    option('Start over', undefined, () => initialState, false),
  ]),
]

export default [
  event(`
Does it even make sense to talk of the date on Earth anymore? The meteor completely annihilated it. Oh God... how can this be happening? It's all gone so fast. We've had less than a year to prepare, to grieve and accept our fate, but nothing can prepare you for actually witnessing it.

This rocket, its fifty crew, and our cargo of cyrogenically frozen embryos represent the only hope to stave off extinction. Can we even make it to Mars? If we do, will we be able to survive?

NASA's best only gave us "something south of 20%" chances. I think they were actually trying to give us hope. With as little warning as we had, it's a miracle we got this rocket in the sky at all. Let's hope it holds together.

I've never been much for religion, but I'm praying now. Please, God, have mercy on our poor souls...`),
  ...terminalEvents,
  event(
    `
Trouble already. There was a violent collision, the whole ship shook worse than lift off. It was probably debris knocked out of earth orbit by the impact. It wouldn't take much delta V for even a satellite screw to end this mission before we've barely left the neighborhood.

The good news is we're still alive, and the hull wasn't compromised. It was a glancing blow.

The bad news is that we had to burn a significant amount of our reserve fuel to correct course, and it took out most of one of the solar arrays.

The solar array presents a real problem. We were on a tight power budget already; and now we don't even have enough to fully power the critical systems: cyrogenics, hydroponics, and life support.

I'll have to make some tough choices here.

Cryogenics represents the future of the species. Ten thousand human embryos... all that's left, besides us of course. Without full power, we can't run all of the freezers, and we'll start losing them. I've consulted with Dr. Miller, and she tells me that while there has been plenty of theorizing about the minimum viable human population, no one really knows. We can't afford to lose too many of our children.

We have a stockpile of rations, but without fully powering the grow lights and other hydroponics systems, we won't be producing enough food to keep up with consumption. There wasn't enough cargo space for food for the whole trip, plus we'll need the crops when we get to Mars anyway. If we don't keep up with food production, in a couple of months we'll be starving.

Finally, the life support systems recycle the air and human waste. I don't think too much needs to be said about this one; nothing else will matter if we suffocate. Clark says we can afford to reduce the allocation here a little bit, but over time carbon dioxide and the rest will build up to critical levels.

Anderson has been studying the imagery from the cameras and drones and thinks that if we could get out there and replace some of the couplers, the panels might still produce enough power to make a difference. Not everything we need, but we'd be better off than we are now.

The problem is that we're really still flying blind here. We didn't see whatever hit us, and even though space is huge, that meteor flung a lot of high speed debris. We occasionally hear pings from smaller bits bouncing off the hull.

Anderson's plan is risky. It requires 3 crew in an approximately 4 hour EVA. If anything else hits us or there is some problem, we might not be able to get them back.

I'm exhausted. I need to get some rest and think this over.

A quick note about the crew: Hitchens almost completely lost it when that thing hit us. Dr. Amin gave him a seditive, but I think PTSD is going to be something most of us will streeuggle with.`,
    propEq('time', 1),
    [
      option(
        'Order the repair mission',
        `
I should have listened to my instincts. Anderson, Wu, and Yorke went out to make the repairs. Around the third hour, while working on the second coupler, we got hit again. A piece of it hit Yorke directly and he was ...obliterated. Anderson was tethered to him. They're both gone... I'm not sure if Anderson survived the impact, but if he did, he has just over an hour of oxygen left. The thought of him tumbling through space, alone and hopeless... not to mention Yorke, who was a good kid.

Wu made it back, but everyone is badly shaken by what's happened.

Their work did restore about a quarter of the original capacity of the array. It's not much, but it might be enough to save some lives down the line. Their sacrifice will be remembered.`,
        kill(2),
      ),
      option(
        'Leave it alone',
        `
Well, it was good that we didn't send anyone out there. Another large chunk of debris hit us and pretty much took out the rest of that array. We're going to be low on power, but it could be worse.

Let's hope it's not worse.
`,
      ),
    ],
  ),

  event('Nothing of interest to report.'),
]
