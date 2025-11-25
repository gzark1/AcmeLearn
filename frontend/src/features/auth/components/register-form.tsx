import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/input'
import { Form, FieldWrapper } from '@/components/ui/form'
import { paths } from '@/config/paths'
import { useRegister } from '@/lib/auth'

export const registerSchema = z
  .object({
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

type RegisterFormProps = {
  onSuccess?: () => void
}

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const navigate = useNavigate()
  const registerMutation = useRegister()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerMutation.mutateAsync({
        email: data.email,
        password: data.password,
      })
      onSuccess?.()
      navigate(paths.app.dashboard.getHref(), { replace: true })
    } catch {
      // Error is handled by api-client (shows toast)
    }
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <FieldWrapper label="Email" error={errors.email} required>
        <Input
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={!!errors.email}
          {...register('email')}
        />
      </FieldWrapper>

      <FieldWrapper label="Password" error={errors.password} required>
        <PasswordInput
          placeholder="Create a password"
          autoComplete="new-password"
          error={!!errors.password}
          {...register('password')}
        />
      </FieldWrapper>

      <FieldWrapper label="Confirm Password" error={errors.confirmPassword} required>
        <PasswordInput
          placeholder="Confirm your password"
          autoComplete="new-password"
          error={!!errors.confirmPassword}
          {...register('confirmPassword')}
        />
      </FieldWrapper>

      <Button
        type="submit"
        className="w-full"
        isLoading={registerMutation.isPending}
        disabled={registerMutation.isPending}
      >
        Create account
      </Button>
    </Form>
  )
}
