import { z } from 'zod';
import { createAgent, fromDecision } from '@statelyai/agent';
import { assign, createActor, setup } from 'xstate';
import { openai } from '@ai-sdk/openai';

const agent = createAgent({
  name: 'todo',
  model: openai('gpt-4o-mini'),
  events: {
    'todo.add': z.object({
      todo: z.object({
        title: z.string().describe('The title of the todo'),
        content: z.string().describe('The content of the todo'),
        completed: z.boolean().describe('The completed value of the todo').optional(),
      }).describe('Adds a new todo'),
    }),
    'todo.toggle': z.object({
      todoId: z.string().describe('The ID of the todo to toggle'),
      completed: z.boolean().describe('The new completed value').optional(),
    }),
  },
  context: {
    todos: z.array(z.object({
      id: z.string(),
      title: z.string(),
      content: z.string(), 
      completed: z.boolean()
    }))
  }
});

const machine = setup({
  types: agent.types,
  actors: {
    agent: fromDecision(agent)
  }
}).createMachine({
  id: 'todo',
  initial: 'idle',
  context: {
    todos: []
  },
  states: {
    idle: {
      invoke: {
        src: 'agent',
        input: ({ context }) => ({
          context,
          messages: agent.getMessages(),
          goal: 'Manage the todo list by adding and toggling todos.'
        })
      },
      on: {
        'todo.add': {
          actions: assign({
            todos: ({ context, event }) => [
              ...context.todos,
              {
                id: crypto.randomUUID(),
                ...event.todo,
                completed: event.todo.completed ?? false
              }
            ]
          })
        },
        'todo.toggle': {
          actions: assign({
            todos: ({ context, event }) => 
              context.todos.map(todo => 
                todo.id === event.todoId 
                  ? { ...todo, completed: event.completed ?? !todo.completed }
                  : todo
              )
          })
        }
      }
    }
  }
});

const actor = createActor(machine)

actor.start()