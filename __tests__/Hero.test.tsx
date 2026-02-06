// @ts-nocheck
import { render, screen } from '@testing-library/react'
import Hero from '../src/components/HeroEgypt'
import '@testing-library/jest-dom'

describe('Hero', () => {
    it('renders the main heading', () => {
        render(<Hero />)
        const heading = screen.getByText(/AIAA/i)
        expect(heading).toBeInTheDocument()
    })
})