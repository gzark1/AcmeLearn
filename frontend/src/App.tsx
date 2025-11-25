import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Input, PasswordInput, Textarea } from '@/components/ui/input'
import { Form, FieldWrapper } from '@/components/ui/form'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Modal, ModalFooter, ConfirmationModal } from '@/components/ui/modal'
import { Dropdown } from '@/components/ui/dropdown'
import { Toaster } from '@/components/ui/toast'
import { Skeleton, SkeletonText, SkeletonCircle } from '@/components/ui/skeleton'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { useNotifications } from '@/stores/notifications'

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { addNotification } = useNotifications()

  const handleLoadingDemo = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="mb-2 text-4xl font-bold text-slate-900">AcmeLearn UI Components</h1>
          <p className="text-lg text-slate-600">Phase 3 - UI Component Library Demo</p>
        </div>

        {/* Spinner */}
        <Card>
          <CardHeader>
            <CardTitle>Spinner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
              <div className="rounded bg-slate-800 p-2">
                <Spinner size="md" variant="light" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button isLoading>Loading</Button>
              <Button disabled>Disabled</Button>
              <Button onClick={handleLoadingDemo} isLoading={isLoading}>
                {isLoading ? 'Processing...' : 'Click to Load'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Inputs */}
        <Card>
          <CardHeader>
            <CardTitle>Inputs</CardTitle>
          </CardHeader>
          <CardContent>
            <Form className="max-w-md">
              <FieldWrapper label="Email" required>
                <Input type="email" placeholder="you@example.com" />
              </FieldWrapper>
              <FieldWrapper label="Password" required>
                <PasswordInput placeholder="Enter your password" />
              </FieldWrapper>
              <FieldWrapper label="With Error" error={{ message: 'This field is required', type: 'required' }}>
                <Input error placeholder="Something went wrong" />
              </FieldWrapper>
              <FieldWrapper label="Description" description="Tell us about yourself">
                <Textarea placeholder="Write something..." />
              </FieldWrapper>
            </Form>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="success">Success / Beginner</Badge>
              <Badge variant="warning">Warning / Intermediate</Badge>
              <Badge variant="error">Error / Advanced</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        <Card>
          <CardHeader>
            <CardTitle>Modals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
              <Button variant="destructive" onClick={() => setIsConfirmOpen(true)}>
                Confirm Delete
              </Button>
            </div>
          </CardContent>
        </Card>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Example Modal"
          description="This is a modal dialog using Headless UI."
        >
          <p className="text-slate-600">
            Modal content goes here. It can contain any React elements.
          </p>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>Save Changes</Button>
          </ModalFooter>
        </Modal>

        <ConfirmationModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={() => {
            setIsConfirmOpen(false)
            addNotification({ type: 'success', title: 'Deleted', message: 'Item was deleted successfully' })
          }}
          title="Delete Item?"
          message="This action cannot be undone. Are you sure you want to delete this item?"
          confirmLabel="Delete"
          isDangerous
        />

        {/* Dropdown */}
        <Card>
          <CardHeader>
            <CardTitle>Dropdown</CardTitle>
          </CardHeader>
          <CardContent>
            <Dropdown
              trigger={<Button variant="secondary">Open Menu</Button>}
              items={[
                { label: 'Profile', onClick: () => addNotification({ type: 'info', title: 'Profile clicked' }) },
                { label: 'Settings', onClick: () => addNotification({ type: 'info', title: 'Settings clicked' }) },
                { label: 'Logout', onClick: () => addNotification({ type: 'warning', title: 'Logout clicked' }), destructive: true },
              ]}
            />
          </CardContent>
        </Card>

        {/* Toast Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Toast Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="primary"
                onClick={() => addNotification({ type: 'success', title: 'Success!', message: 'Operation completed' })}
              >
                Success Toast
              </Button>
              <Button
                variant="destructive"
                onClick={() => addNotification({ type: 'error', title: 'Error!', message: 'Something went wrong' })}
              >
                Error Toast
              </Button>
              <Button
                variant="secondary"
                onClick={() => addNotification({ type: 'warning', title: 'Warning', message: 'Please check your input' })}
              >
                Warning Toast
              </Button>
              <Button
                variant="ghost"
                onClick={() => addNotification({ type: 'info', title: 'Info', message: 'Here is some information' })}
              >
                Info Toast
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Skeleton */}
        <Card>
          <CardHeader>
            <CardTitle>Skeleton Loading</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <SkeletonCircle size={48} />
              <div className="flex-1">
                <Skeleton className="mb-2 h-4 w-1/3" />
                <SkeletonText lines={2} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Table</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>John Doe</TableCell>
                  <TableCell>john@example.com</TableCell>
                  <TableCell><Badge variant="success">Active</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Jane Smith</TableCell>
                  <TableCell>jane@example.com</TableCell>
                  <TableCell><Badge variant="success">Active</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Bob Wilson</TableCell>
                  <TableCell>bob@example.com</TableCell>
                  <TableCell><Badge variant="default">Inactive</Badge></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Card Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Card with Footer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">
              Cards can have headers, content, and footers. They are used to group related content.
            </p>
          </CardContent>
          <CardFooter className="justify-end gap-2 border-t border-slate-100 pt-4">
            <Button variant="ghost">Cancel</Button>
            <Button>Save</Button>
          </CardFooter>
        </Card>

        <p className="text-center text-sm text-slate-400">
          Phase 3 Complete - All UI Components Working!
        </p>
      </div>

      {/* Toast container */}
      <Toaster />
    </div>
  )
}

export default App
