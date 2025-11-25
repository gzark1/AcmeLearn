import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/input'
import { Form, FieldWrapper } from '@/components/ui/form'
import { paths } from '@/config/paths'
import { useLogin } from '@/lib/auth'

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

type LoginFormProps = {
  onSuccess?: () => void
}

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')

  const login = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login.mutateAsync(data)
      onSuccess?.()
      navigate(redirectTo || paths.app.dashboard.getHref(), { replace: true })
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
          placeholder="Enter your password"
          autoComplete="current-password"
          error={!!errors.password}
          {...register('password')}
        />
      </FieldWrapper>

      <Button
        type="submit"
        className="w-full"
        isLoading={login.isPending}
        disabled={login.isPending}
      >
        Sign in
      </Button>
    </Form>
  )
}
