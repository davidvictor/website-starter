"use client"

import { ArrowRight, CheckCircle2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"

type FieldKey = "firstName" | "lastName" | "email" | "company" | "message"
type FieldErrors = Partial<Record<FieldKey, string>>
type SubmitState = "idle" | "submitting" | "success" | "error"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function textValue(form: FormData, key: FieldKey) {
  return String(form.get(key) ?? "").trim()
}

function validate(form: FormData): FieldErrors {
  const errors: FieldErrors = {}
  if (!textValue(form, "firstName")) {
    errors.firstName = "Add a first name."
  }
  if (!textValue(form, "lastName")) {
    errors.lastName = "Add a last name."
  }
  if (!EMAIL_RE.test(textValue(form, "email"))) {
    errors.email = "Use a valid work email."
  }
  if (!textValue(form, "company")) {
    errors.company = "Add a company name."
  }
  if (textValue(form, "message").length < 12) {
    errors.message = "Share at least a sentence so we can route the note."
  }
  return errors
}

export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const timeoutRef = useRef<number | null>(null)
  const [status, setStatus] = useState<SubmitState>("idle")
  const [errors, setErrors] = useState<FieldErrors>({})

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const hasErrors = Object.keys(errors).length > 0
  const submitting = status === "submitting"

  return (
    <form
      ref={formRef}
      noValidate
      className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 lg:p-8"
      onSubmit={(event) => {
        event.preventDefault()
        const nextErrors = validate(new FormData(event.currentTarget))
        setErrors(nextErrors)
        if (Object.keys(nextErrors).length > 0) {
          setStatus("error")
          const firstInvalid = Object.keys(nextErrors)[0]
          if (firstInvalid) {
            document.getElementById(firstInvalid)?.focus()
          }
          return
        }

        setStatus("submitting")
        timeoutRef.current = window.setTimeout(() => {
          setStatus("success")
          setErrors({})
          formRef.current?.reset()
        }, 550)
      }}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field data-invalid={Boolean(errors.firstName)}>
          <FieldLabel htmlFor="firstName">First name</FieldLabel>
          <Input
            id="firstName"
            name="firstName"
            placeholder="Jane"
            autoComplete="given-name"
            disabled={submitting}
            aria-invalid={Boolean(errors.firstName)}
            aria-describedby={errors.firstName ? "firstName-error" : undefined}
          />
          <FieldError id="firstName-error">{errors.firstName}</FieldError>
        </Field>
        <Field data-invalid={Boolean(errors.lastName)}>
          <FieldLabel htmlFor="lastName">Last name</FieldLabel>
          <Input
            id="lastName"
            name="lastName"
            placeholder="Doe"
            autoComplete="family-name"
            disabled={submitting}
            aria-invalid={Boolean(errors.lastName)}
            aria-describedby={errors.lastName ? "lastName-error" : undefined}
          />
          <FieldError id="lastName-error">{errors.lastName}</FieldError>
        </Field>
      </div>

      <Field data-invalid={Boolean(errors.email)}>
        <FieldLabel htmlFor="email">Work email</FieldLabel>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="jane@company.com"
          autoComplete="email"
          disabled={submitting}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        <FieldError id="email-error">{errors.email}</FieldError>
      </Field>

      <Field data-invalid={Boolean(errors.company)}>
        <FieldLabel htmlFor="company">Company</FieldLabel>
        <Input
          id="company"
          name="company"
          placeholder="Hyperion Labs"
          autoComplete="organization"
          disabled={submitting}
          aria-invalid={Boolean(errors.company)}
          aria-describedby={errors.company ? "company-error" : undefined}
        />
        <FieldError id="company-error">{errors.company}</FieldError>
      </Field>

      <Field data-invalid={Boolean(errors.message)}>
        <FieldLabel htmlFor="message">What are you building?</FieldLabel>
        <Textarea
          id="message"
          name="message"
          rows={4}
          placeholder="A reasoning system that finally ships."
          disabled={submitting}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={
            errors.message ? "message-hint message-error" : "message-hint"
          }
        />
        <FieldDescription id="message-hint">
          A sentence or two is enough for the first pass.
        </FieldDescription>
        <FieldError id="message-error">{errors.message}</FieldError>
      </Field>

      {hasErrors && status === "error" && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          Review the highlighted fields and try again.
        </div>
      )}

      {status === "success" && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-start gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
          <span>
            Message captured. In a client clone, wire this same state pattern to
            the CRM or server action.
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          We never spam. We never share your email. We do reply.
        </p>
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting && <Spinner className="size-4" />}
          {submitting ? "Sending" : "Send message"}
          {!submitting && <ArrowRight className="size-4" />}
        </Button>
      </div>
    </form>
  )
}
